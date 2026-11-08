import { createFileRoute } from "@tanstack/react-router";

// Public election API (citizen voting + admin console). Admin endpoints verify the
// caller's session and admin role inside the handler.
async function handle(request: Request, splat: string) {
  const m = await import("@/lib/election.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { json } = m;
  const method = request.method;
  const path = "/" + splat.replace(/\/$/, "");
  const body = method === "POST" ? await request.json().catch(() => ({})) : {};

  // ---------- PUBLIC ----------
  if (method === "GET" && path === "/status") {
    const [settings, parties, candidates, total, fp] = await Promise.all([
      m.getSettings(),
      m.getParties(),
      m.getCandidates(),
      m.countBallots(),
      m.ipFingerprint(request),
    ]);
    const { count } = await supabaseAdmin
      .from("ballots")
      .select("id", { count: "exact", head: true })
      .eq("ip_fingerprint", fp);
    return json({
      settings,
      hasVoted: (count ?? 0) > 0,
      totalValidBallots: total + parties.reduce((a, p) => a + (p.manualVoteAdjustment || 0), 0),
      totalParties: parties.filter((p) => p.isPublic).length,
      totalCandidates: candidates.filter((c) => c.isActive).length,
    });
  }

  if (method === "GET" && path === "/parties") {
    const [parties, candidates] = await Promise.all([m.getParties(), m.getCandidates()]);
    return json(
      parties
        .filter((p) => p.isPublic)
        .map((p) => ({
          ...p,
          candidates: candidates.filter((c) => c.partyId === p.id && c.isActive),
        })),
    );
  }

  if (method === "GET" && path === "/results") {
    const { results } = await m.computeResults();
    if (!results.publicResultsEnabled) {
      return json({
        publicResultsEnabled: false,
        resultsStatus: results.resultsStatus,
        message: "Les résultats ne sont pas encore rendus publics par l'administration.",
        totalBallots: 0,
        parties: [],
        candidatesByParty: {},
        lastUpdated: results.lastUpdated,
      });
    }
    return json(results);
  }

  if (method === "POST" && path === "/vote") {
    const { partyId, candidateIds } = body as { partyId?: unknown; candidateIds?: unknown };
    if (typeof partyId !== "string" || !Array.isArray(candidateIds) || !candidateIds.every((c) => typeof c === "string")) {
      return json({ error: "Format des candidats invalide." }, 400);
    }
    const fp = await m.ipFingerprint(request);
    const { data, error } = await supabaseAdmin.rpc("cast_ballot", {
      p_party_id: partyId,
      p_candidate_ids: candidateIds as string[],
      p_fp: fp,
    });
    if (error) return json({ error: "Erreur lors de l'enregistrement du vote." }, 500);
    const r = data as { ok: boolean; code?: string; error?: string; ballotId?: string };
    if (!r.ok) return json({ error: r.error, code: r.code }, r.code ? 403 : 400);
    return json({ success: true, ballotId: r.ballotId, message: "Vote enregistré avec succès." });
  }

  // ---------- ADMIN ----------
  if (path.startsWith("/admin/")) {
    const admin = await m.verifyAdmin(request);
    if (!admin) return json({ error: "Accès administrateur non autorisé." }, 401);
    const sub = path.slice("/admin".length);

    if (method === "GET" && sub === "/me") return json({ email: admin });

    if (method === "GET" && sub === "/dashboard") {
      const { results, settings, ballots } = await m.computeResults();
      const [sec, logs] = await Promise.all([m.getSecurityRecords(), m.getLogs()]);
      return json({
        settings,
        totalBallots: results.totalBallots,
        candidateSelections: ballots.reduce((a, b) => a + b.candidate_ids.length, 0),
        uniqueIps: new Set(ballots.map((b) => b.ip_fingerprint)).size,
        blockedAttempts: sec.reduce((a, s) => (s.status === "blocked" ? a + s.attemptsCount : a), 0),
        parties: results.parties,
        candidatesByParty: results.candidatesByParty,
        recentLogs: logs.slice(0, 8),
        securityStats: {
          totalRecords: sec.length,
          votedCount: sec.filter((s) => s.status === "voted").length,
          blockedCount: sec.filter((s) => s.status === "blocked").length,
        },
      });
    }

    if (method === "POST" && sub === "/adjust-votes") {
      const { type, entityId, adjustment, reason } = body as Record<string, unknown>;
      if (typeof reason !== "string" || reason.trim().length < 3)
        return json({ error: "Le motif de modification est obligatoire (au moins 3 caractères)." }, 400);
      const delta = Number(adjustment);
      if (!Number.isFinite(delta) || delta === 0 || !Number.isInteger(delta))
        return json({ error: "Quantité d'ajustement invalide." }, 400);
      const table = type === "party" ? "parties" : type === "candidate" ? "candidates" : null;
      if (!table) return json({ error: "Type invalide (party ou candidate)." }, 400);
      const { data: row } = await supabaseAdmin.from(table).select("*").eq("id", String(entityId)).maybeSingle();
      if (!row) return json({ error: type === "party" ? "Liste non trouvée." : "Candidat non trouvé." }, 404);
      const cur = row.manual_vote_adjustment || 0;
      const next = cur + delta;
      if (next < 0) return json({ error: "Le compteur ne peut pas devenir négatif." }, 400);
      await supabaseAdmin.from(table).update({ manual_vote_adjustment: next }).eq("id", row.id);
      const name = "first_name" in row ? `${row.first_name} ${row.last_name}` : (row as { name: string }).name;
      await m.addLog({
        adminUsername: admin,
        action:
          type === "party"
            ? delta > 0 ? "AJOUT_VOIX_LISTE" : "RETRAIT_VOIX_LISTE"
            : delta > 0 ? "AJOUT_VOIX_CANDIDAT" : "RETRAIT_VOIX_CANDIDAT",
        entityType: type as "party" | "candidate",
        entityId: row.id,
        entityName: name,
        oldValue: cur,
        adjustment: delta,
        newValue: next,
        reason: reason.trim(),
      });
      return json({ success: true, newValue: next });
    }

    if (method === "POST" && sub === "/parties/update") {
      const { id, name, arabicName, listNumber, isPublic, logoUrl } = body as Record<string, unknown>;
      const upd: Record<string, unknown> = {};
      if (name) upd.name = String(name);
      if (arabicName) upd.arabic_name = String(arabicName);
      if (listNumber !== undefined) upd.list_number = Number(listNumber);
      if (isPublic !== undefined) upd.is_public = Boolean(isPublic);
      if (logoUrl) upd.logo_url = String(logoUrl);
      const { data: p } = await supabaseAdmin.from("parties").update(upd).eq("id", String(id)).select().maybeSingle();
      if (!p) return json({ error: "Liste non trouvée." }, 404);
      await m.addLog({
        adminUsername: admin, action: "MODIFICATION_LISTE", entityType: "party", entityId: p.id, entityName: p.name,
        oldValue: null, adjustment: null, newValue: JSON.stringify({ name: p.name, isPublic: p.is_public }),
        reason: "Mise à jour des informations de la liste",
      });
      return json({ success: true });
    }

    if (method === "POST" && sub === "/candidates/save") {
      const b = body as Record<string, unknown>;
      if (b.id) {
        const upd: Record<string, unknown> = {};
        if (b.firstName) upd.first_name = String(b.firstName);
        if (b.lastName) upd.last_name = String(b.lastName);
        if (b.arabicName) upd.arabic_name = String(b.arabicName);
        if (b.listPosition !== undefined) upd.list_position = Number(b.listPosition);
        if (b.profession !== undefined) upd.profession = b.profession ? String(b.profession) : null;
        if (b.age !== undefined) upd.age = b.age ? Number(b.age) : null;
        if (b.photoUrl) upd.photo_url = String(b.photoUrl);
        const { data: c } = await supabaseAdmin.from("candidates").update(upd).eq("id", String(b.id)).select().maybeSingle();
        if (!c) return json({ error: "Candidat introuvable." }, 404);
        await m.addLog({
          adminUsername: admin, action: "MODIFICATION_CANDIDAT", entityType: "candidate", entityId: c.id,
          entityName: `${c.first_name} ${c.last_name}`, oldValue: "Informations précédentes", adjustment: null,
          newValue: `${c.first_name} ${c.last_name} (N° ${c.list_position})`, reason: "Modification fiche candidat",
        });
        return json({ success: true });
      }
      const partyId = String(b.partyId);
      const { count } = await supabaseAdmin.from("candidates").select("id", { count: "exact", head: true }).eq("party_id", partyId);
      const { data: c, error } = await supabaseAdmin
        .from("candidates")
        .insert({
          id: `${partyId}-${Date.now()}`,
          party_id: partyId,
          first_name: String(b.firstName || "Nouveau"),
          last_name: String(b.lastName || "Candidat"),
          arabic_name: String(b.arabicName || ""),
          list_position: Number(b.listPosition) || (count ?? 0) + 1,
          photo_url: String(b.photoUrl || ""),
          profession: b.profession ? String(b.profession) : null,
          age: b.age ? Number(b.age) : null,
        })
        .select()
        .single();
      if (error) return json({ error: "Liste invalide." }, 400);
      await m.addLog({
        adminUsername: admin, action: "AJOUT_CANDIDAT", entityType: "candidate", entityId: c.id,
        entityName: `${c.first_name} ${c.last_name}`, oldValue: null, adjustment: null,
        newValue: `Créé sous la liste ${partyId}`, reason: "Ajout nouveau candidat",
      });
      return json({ success: true });
    }

    if (method === "POST" && sub === "/candidates/delete") {
      const { data: c } = await supabaseAdmin
        .from("candidates").update({ is_active: false }).eq("id", String((body as { id?: string }).id)).select().maybeSingle();
      if (!c) return json({ error: "Candidat introuvable." }, 404);
      await m.addLog({
        adminUsername: admin, action: "SUPPRESSION_CANDIDAT", entityType: "candidate", entityId: c.id,
        entityName: `${c.first_name} ${c.last_name}`, oldValue: "Actif", adjustment: null, newValue: "Désactivé",
        reason: "Suppression confirmée par administrateur",
      });
      return json({ success: true });
    }

    if (method === "GET" && sub === "/security") {
      const [settings, records] = await Promise.all([m.getSettings(), m.getSecurityRecords()]);
      return json({
        ipProtectionEnabled: settings.ipProtectionEnabled,
        records,
        totalVotedIps: records.filter((s) => s.status === "voted").length,
        totalBlockedAttempts: records.reduce((a, s) => (s.status === "blocked" ? a + s.attemptsCount : a), 0),
      });
    }

    if (method === "POST" && sub === "/security/unblock") {
      const { ipFingerprint, reason } = body as { ipFingerprint?: string; reason?: string };
      if (!reason || reason.trim().length < 3) return json({ error: "Le motif de déblocage est obligatoire." }, 400);
      if (!ipFingerprint) return json({ error: "Empreinte manquante." }, 400);
      await supabaseAdmin
        .from("security_records")
        .upsert({ ip_fingerprint: ipFingerprint, status: "unblocked", reason }, { onConflict: "ip_fingerprint" });
      await m.addLog({
        adminUsername: admin, action: "DEBLOCAGE_IP", entityType: "security",
        entityId: ipFingerprint.substring(0, 10) + "...", entityName: "Empreinte IP anonymisée",
        oldValue: "Bloqué", adjustment: null, newValue: "Débloqué", reason: reason.trim(),
      });
      return json({ success: true, message: "Empreinte IP débloquée avec succès." });
    }

    if (method === "POST" && sub === "/security/toggle-ip") {
      const settings = await m.getSettings();
      const old = settings.ipProtectionEnabled;
      settings.ipProtectionEnabled = Boolean((body as { enabled?: boolean }).enabled);
      await m.saveSettings(settings);
      await m.addLog({
        adminUsername: admin, action: "MODIFICATION_SECURITE_IP", entityType: "security", entityId: "ip_protection",
        entityName: "Protection Anti-Doublon IP", oldValue: old, adjustment: null, newValue: settings.ipProtectionEnabled,
        reason: settings.ipProtectionEnabled ? "Activation du filtrage par IP" : "Désactivation du filtrage par IP",
      });
      return json({ success: true, ipProtectionEnabled: settings.ipProtectionEnabled });
    }

    if (method === "GET" && sub === "/audit-logs") {
      const url = new URL(request.url);
      const q = url.searchParams.get("query")?.toLowerCase();
      const type = url.searchParams.get("entityType");
      let logs = await m.getLogs();
      if (type && type !== "all") logs = logs.filter((l) => l.entityType === type);
      if (q)
        logs = logs.filter(
          (l) => l.entityName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q),
        );
      return json(logs);
    }

    if (method === "POST" && sub === "/settings") {
      const s = await m.getSettings();
      const b = body as Record<string, unknown>;
      for (const k of ["name", "municipality", "wilaya", "eventDate", "welcomeTitleFr", "welcomeTitleAr", "welcomeSubtitleFr", "welcomeSubtitleAr", "resultsStatus"] as const) {
        if (b[k]) (s as unknown as Record<string, unknown>)[k] = String(b[k]);
      }
      if (b.publicResultsEnabled !== undefined) s.publicResultsEnabled = Boolean(b.publicResultsEnabled);
      if (b.minCandidates) s.minCandidates = Number(b.minCandidates);
      if (b.maxCandidates) s.maxCandidates = Number(b.maxCandidates);
      await m.saveSettings(s);
      await m.addLog({
        adminUsername: admin, action: "MODIFICATION_PARAMETRES", entityType: "settings", entityId: "general",
        entityName: "Paramètres généraux", oldValue: "Configuration précédente", adjustment: null,
        newValue: `Date: ${s.eventDate}, Résultats publics: ${s.publicResultsEnabled}, Statut: ${s.resultsStatus}`,
        reason: "Mise à jour des paramètres de la plateforme",
      });
      return json({ success: true, settings: s });
    }

    if (method === "POST" && sub === "/reset-election") {
      const { confirmationPhrase, reason } = body as { confirmationPhrase?: string; reason?: string };
      if (confirmationPhrase !== "REINITIALISER")
        return json({ error: 'Veuillez saisir exactement "REINITIALISER" pour confirmer.' }, 400);
      const prev = await m.countBallots();
      await supabaseAdmin.from("ballots").delete().neq("id", "");
      await supabaseAdmin.from("security_records").delete().neq("ip_fingerprint", "");
      await supabaseAdmin.from("parties").update({ manual_vote_adjustment: 0 }).neq("id", "");
      await supabaseAdmin.from("candidates").update({ manual_vote_adjustment: 0 }).neq("id", "");
      await m.addLog({
        adminUsername: admin, action: "REINITIALISATION_ELECTION", entityType: "database", entityId: "all",
        entityName: "Tous les bulletins et compteurs", oldValue: `${prev} bulletins`, adjustment: -prev,
        newValue: "0 bulletin", reason: reason || "Réinitialisation complète ordonnée par l'administrateur",
      });
      return json({ success: true, message: "La consultation a été réinitialisée avec succès." });
    }

    if (method === "GET" && sub === "/export-csv") {
      const { results } = await m.computeResults();
      let csv = "Type,ID,Nom,Numero/Position,Voix/Bulletins,Pourcentage\n";
      for (const p of results.parties) {
        csv += `Liste,${p.id},"${p.name} - ${p.arabicName}",${p.listNumber},${p.ballotCount},${p.percentage}%\n`;
        for (const c of results.candidatesByParty[p.id] || [])
          csv += `Candidat,${c.id},"${c.firstName} ${c.lastName}",${c.listPosition},${c.voteCount},${c.percentage}%\n`;
      }
      return new Response("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=elections_seddouk_2026_${Date.now()}.csv`,
        },
      });
    }
  }

  return json({ error: "Not found" }, 404);
}

export const Route = createFileRoute("/api/public/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => handle(request, params._splat ?? ""),
      POST: ({ request, params }) => handle(request, params._splat ?? ""),
    },
  },
});
