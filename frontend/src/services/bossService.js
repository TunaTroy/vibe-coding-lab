import { apiFetch } from "./api";

export const fetchJourney = (tenseId) =>
  apiFetch(`/api/tenses/${encodeURIComponent(tenseId)}/journey`);

export const fetchBoss = (bossId) =>
  apiFetch(`/api/bosses/${encodeURIComponent(bossId)}`);

export const startBossAttempt = (bossId) =>
  apiFetch(`/api/bosses/${encodeURIComponent(bossId)}/attempts`, { method: "POST" });

export const fetchBossAttempt = (attemptId) =>
  apiFetch(`/api/boss-attempts/${encodeURIComponent(attemptId)}`);

export const submitBossAnswer = (attemptId, questionId, answer) =>
  apiFetch(`/api/boss-attempts/${encodeURIComponent(attemptId)}/answers`, {
    method: "POST",
    body: { questionId, answer },
  });
