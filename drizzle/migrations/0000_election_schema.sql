CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.assign_admin_for_owner_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'seddouk2004@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_assign_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_admin_for_owner_email();

CREATE TABLE public.election_settings (id text PRIMARY KEY, data jsonb NOT NULL);
CREATE TABLE public.parties (
  id text PRIMARY KEY, name text NOT NULL, arabic_name text NOT NULL DEFAULT '',
  list_number int NOT NULL, logo_url text NOT NULL DEFAULT '', theme_color text NOT NULL DEFAULT '#0060A8',
  accent_color text NOT NULL DEFAULT '#0060A8', is_public boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0, manual_vote_adjustment int NOT NULL DEFAULT 0
);
CREATE TABLE public.candidates (
  id text PRIMARY KEY, party_id text NOT NULL REFERENCES public.parties(id),
  list_position int NOT NULL, first_name text NOT NULL, last_name text NOT NULL,
  arabic_name text NOT NULL DEFAULT '', photo_url text NOT NULL DEFAULT '', profession text, age int,
  is_active boolean NOT NULL DEFAULT true, manual_vote_adjustment int NOT NULL DEFAULT 0
);
CREATE TABLE public.ballots (
  id text PRIMARY KEY, party_id text NOT NULL REFERENCES public.parties(id),
  candidate_ids text[] NOT NULL, ip_fingerprint text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ballots_ip_idx ON public.ballots(ip_fingerprint);
CREATE TABLE public.security_records (
  ip_fingerprint text PRIMARY KEY, first_seen timestamptz NOT NULL DEFAULT now(),
  last_attempt timestamptz NOT NULL DEFAULT now(), attempts_count int NOT NULL DEFAULT 0,
  status text NOT NULL, reason text
);
CREATE TABLE public.audit_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, admin_username text NOT NULL, action text NOT NULL,
  entity_type text NOT NULL, entity_id text NOT NULL, entity_name text NOT NULL,
  old_value jsonb, adjustment int, new_value jsonb, reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.vote_events (
  id bigserial PRIMARY KEY, party_id text NOT NULL, party_name text NOT NULL, list_number int NOT NULL,
  candidate_count int NOT NULL, total_ballots int NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.election_settings TO service_role;
ALTER TABLE public.election_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.parties TO service_role;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.candidates TO service_role;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.ballots TO service_role;
ALTER TABLE public.ballots ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.security_records TO service_role;
ALTER TABLE public.security_records ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.vote_events TO anon, authenticated;
GRANT ALL ON public.vote_events TO service_role;
GRANT USAGE ON SEQUENCE public.vote_events_id_seq TO service_role;
ALTER TABLE public.vote_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see anonymous vote events" ON public.vote_events FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.vote_events;

CREATE OR REPLACE FUNCTION public.cast_ballot(p_party_id text, p_candidate_ids text[], p_fp text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s jsonb; sec public.security_records; pty public.parties; minc int; maxc int; n int; valid int;
  bid text; total int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_fp));
  SELECT data INTO s FROM election_settings WHERE id = 'main';
  SELECT * INTO sec FROM security_records WHERE ip_fingerprint = p_fp;
  IF coalesce((s->>'ipProtectionEnabled')::boolean, true) THEN
    IF sec.status = 'blocked' THEN
      RETURN jsonb_build_object('ok', false, 'code', 'IP_BLOCKED', 'error', 'Votre adresse IP a été bloquée pour cause de requêtes suspectes.');
    END IF;
    IF EXISTS (SELECT 1 FROM ballots WHERE ip_fingerprint = p_fp) AND (sec.ip_fingerprint IS NULL OR sec.status <> 'unblocked') THEN
      INSERT INTO security_records (ip_fingerprint, attempts_count, status, reason)
      VALUES (p_fp, 1, 'blocked', 'Tentative de vote multiple refusée')
      ON CONFLICT (ip_fingerprint) DO UPDATE SET attempts_count = security_records.attempts_count + 1, last_attempt = now();
      RETURN jsonb_build_object('ok', false, 'code', 'ALREADY_VOTED', 'error', 'Vous avez déjà participé au vote. Un seul vote est autorisé par adresse IP. Merci de votre compréhension.');
    END IF;
  END IF;
  SELECT * INTO pty FROM parties WHERE id = p_party_id AND is_public;
  IF pty.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Liste candidate invalide ou indisponible.');
  END IF;
  minc := coalesce(nullif((s->>'minCandidates')::int, 0), 1);
  maxc := coalesce(nullif((s->>'maxCandidates')::int, 0), 10);
  n := coalesce(array_length(p_candidate_ids, 1), 0);
  IF n < minc OR n > maxc THEN
    RETURN jsonb_build_object('ok', false, 'error', format('Vous devez sélectionner entre %s et %s candidats maximum.', minc, maxc));
  END IF;
  IF (SELECT count(DISTINCT x) FROM unnest(p_candidate_ids) x) <> n THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Un candidat ne peut pas être sélectionné plusieurs fois.');
  END IF;
  SELECT count(*) INTO valid FROM candidates WHERE id = ANY(p_candidate_ids) AND party_id = p_party_id AND is_active;
  IF valid <> n THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sélection invalide : un ou plusieurs candidats n''appartiennent pas à la liste choisie.');
  END IF;
  bid := 'ballot-' || (extract(epoch from clock_timestamp())*1000)::bigint || '-' || substr(md5(random()::text), 1, 5);
  INSERT INTO ballots (id, party_id, candidate_ids, ip_fingerprint) VALUES (bid, p_party_id, p_candidate_ids, p_fp);
  INSERT INTO security_records (ip_fingerprint, attempts_count, status)
  VALUES (p_fp, 1, 'voted')
  ON CONFLICT (ip_fingerprint) DO UPDATE SET status = 'voted', last_attempt = now(), attempts_count = security_records.attempts_count + 1;
  SELECT (SELECT count(*) FROM ballots) + (SELECT coalesce(sum(manual_vote_adjustment), 0) FROM parties) INTO total;
  INSERT INTO vote_events (party_id, party_name, list_number, candidate_count, total_ballots)
  VALUES (pty.id, pty.name, pty.list_number, n, total);
  RETURN jsonb_build_object('ok', true, 'ballotId', bid);
END $$;
REVOKE EXECUTE ON FUNCTION public.cast_ballot(text, text[], text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cast_ballot(text, text[], text) TO service_role;