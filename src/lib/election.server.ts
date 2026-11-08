// Server-only election engine: replaces the original Express + db.json backend.
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import type {
  ElectionSettings,
  Party,
  Candidate,
  PartyResult,
  CandidateResult,
  ResultsData,
  AuditLog,
  SecurityRecord,
} from "@/election/types";

type PartyRow = Database["public"]["Tables"]["parties"]["Row"];
type CandRow = Database["public"]["Tables"]["candidates"]["Row"];

export const json = (data: unknown, status = 200) => Response.json(data, { status });

const toParty = (p: PartyRow): Party => ({
  id: p.id,
  name: p.name,
  arabicName: p.arabic_name,
  listNumber: p.list_number,
  logoUrl: p.logo_url,
  themeColor: p.theme_color,
  accentColor: p.accent_color,
  isPublic: p.is_public,
  displayOrder: p.display_order,
  manualVoteAdjustment: p.manual_vote_adjustment,
  ballotCount: 0,
});

const toCandidate = (c: CandRow): Candidate => ({
  id: c.id,
  partyId: c.party_id,
  listPosition: c.list_position,
  firstName: c.first_name,
  lastName: c.last_name,
  arabicName: c.arabic_name,
  photoUrl: c.photo_url,
  profession: c.profession ?? undefined,
  age: c.age ?? undefined,
  isActive: c.is_active,
  manualVoteAdjustment: c.manual_vote_adjustment,
  voteCount: 0,
});

export async function getSettings(): Promise<ElectionSettings> {
  const { data, error } = await supabaseAdmin.from("election_settings").select("data").eq("id", "main").single();
  if (error) throw error;
  return data.data as unknown as ElectionSettings;
}

export async function saveSettings(settings: ElectionSettings) {
  const { error } = await supabaseAdmin
    .from("election_settings")
    .update({ data: settings as never })
    .eq("id", "main");
  if (error) throw error;
}

export async function getParties(): Promise<Party[]> {
  const { data, error } = await supabaseAdmin.from("parties").select("*").order("display_order");
  if (error) throw error;
  return data.map(toParty);
}

export async function getCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabaseAdmin.from("candidates").select("*").order("list_position");
  if (error) throw error;
  return data.map(toCandidate);
}

async function getAllBallots() {
  const rows: { party_id: string; candidate_ids: string[]; ip_fingerprint: string }[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabaseAdmin
      .from("ballots")
      .select("party_id, candidate_ids, ip_fingerprint")
      .order("created_at")
      .range(from, from + page - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < page) break;
  }
  return rows;
}

export async function countBallots() {
  const { count, error } = await supabaseAdmin.from("ballots").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function computeResults() {
  const [settings, parties, candidates, ballots] = await Promise.all([
    getSettings(),
    getParties(),
    getCandidates(),
    getAllBallots(),
  ]);
  const partyCounts: Record<string, number> = {};
  for (const p of parties) partyCounts[p.id] = p.manualVoteAdjustment || 0;
  const candVotes: Record<string, number> = {};
  for (const c of candidates) candVotes[c.id] = c.manualVoteAdjustment || 0;
  for (const b of ballots) {
    partyCounts[b.party_id] = (partyCounts[b.party_id] || 0) + 1;
    for (const id of b.candidate_ids) candVotes[id] = (candVotes[id] || 0) + 1;
  }
  const sum = Object.values(partyCounts).reduce((a, b) => a + b, 0);

  const partyResults: PartyResult[] = parties
    .filter((p) => p.isPublic)
    .map((p) => {
      const count = partyCounts[p.id] || 0;
      return {
        id: p.id,
        name: p.name,
        arabicName: p.arabicName,
        listNumber: p.listNumber,
        logoUrl: p.logoUrl,
        themeColor: p.themeColor,
        accentColor: p.accentColor,
        ballotCount: count,
        percentage: sum > 0 ? Number(((count / sum) * 100).toFixed(1)) : 0,
        rank: 1,
        candidateCount: candidates.filter((c) => c.partyId === p.id && c.isActive).length,
      };
    });
  partyResults.sort((a, b) => b.ballotCount - a.ballotCount || a.listNumber - b.listNumber);
  partyResults.forEach((p, i) => {
    p.rank = i > 0 && p.ballotCount === partyResults[i - 1].ballotCount ? partyResults[i - 1].rank : i + 1;
  });

  const candidatesByParty: Record<string, CandidateResult[]> = {};
  for (const p of parties) {
    const pBallots = partyCounts[p.id] || 0;
    const list: CandidateResult[] = candidates
      .filter((c) => c.partyId === p.id && c.isActive)
      .map((c) => {
        const v = candVotes[c.id] || 0;
        return {
          id: c.id,
          partyId: c.partyId,
          listPosition: c.listPosition,
          firstName: c.firstName,
          lastName: c.lastName,
          arabicName: c.arabicName,
          photoUrl: c.photoUrl,
          profession: c.profession,
          age: c.age,
          voteCount: v,
          percentage: pBallots > 0 ? Number(((v / pBallots) * 100).toFixed(1)) : 0,
          rank: 1,
        };
      });
    list.sort((a, b) => b.voteCount - a.voteCount || a.listPosition - b.listPosition);
    list.forEach((c, j) => {
      c.rank = j > 0 && c.voteCount === list[j - 1].voteCount ? list[j - 1].rank : j + 1;
    });
    candidatesByParty[p.id] = list;
  }

  const results: ResultsData = {
    publicResultsEnabled: settings.publicResultsEnabled,
    resultsStatus: settings.resultsStatus,
    totalBallots: sum,
    parties: partyResults,
    candidatesByParty,
    lastUpdated: new Date().toISOString(),
  };
  return { results, settings, parties, candidates, ballots };
}

// One fingerprint per client IP, HMAC'd so raw IPs are never stored.
export async function ipFingerprint(request: Request): Promise<string> {
  const fwd = request.headers.get("x-forwarded-for");
  let ip = request.headers.get("cf-connecting-ip") || (fwd ? fwd.split(",")[0].trim() : "") || "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  const secret = process.env.VOTE_SECRET || "seddouk-2026-elections-secret-key-dz-06";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Returns the admin's email, or null when the bearer token is not a signed-in admin.
export async function verifyAdmin(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const userClient = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data: userData, error } = await userClient.auth.getUser(token);
  if (error || !userData.user) return null;
  const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  return isAdmin ? userData.user.email ?? "admin" : null;
}

export async function addLog(log: Omit<AuditLog, "id" | "createdAt">) {
  await supabaseAdmin.from("audit_logs").insert({
    admin_username: log.adminUsername,
    action: log.action,
    entity_type: log.entityType,
    entity_id: log.entityId,
    entity_name: log.entityName,
    old_value: (log.oldValue ?? null) as never,
    adjustment: log.adjustment,
    new_value: (log.newValue ?? null) as never,
    reason: log.reason,
  });
}

export async function getLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data.map((l) => ({
    id: l.id,
    adminUsername: l.admin_username,
    action: l.action,
    entityType: l.entity_type as AuditLog["entityType"],
    entityId: l.entity_id,
    entityName: l.entity_name,
    oldValue: l.old_value,
    adjustment: l.adjustment,
    newValue: l.new_value,
    reason: l.reason,
    createdAt: l.created_at,
  }));
}

export async function getSecurityRecords(): Promise<SecurityRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("security_records")
    .select("*")
    .order("last_attempt", { ascending: false });
  if (error) throw error;
  return data.map((s) => ({
    ipFingerprint: s.ip_fingerprint,
    firstSeen: s.first_seen,
    lastAttempt: s.last_attempt,
    attemptsCount: s.attempts_count,
    status: s.status as SecurityRecord["status"],
    reason: s.reason ?? undefined,
  }));
}
