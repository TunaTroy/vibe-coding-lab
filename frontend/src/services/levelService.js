import api from './api.js';

export async function fetchFirstLevel() {
  return api.request('/api/levels/first');
}

export async function fetchLevelQuestions(levelId) {
  return api.request(`/api/levels/${levelId}/questions`);
}

export async function submitLevel(levelId, answers) {
  return api.request(`/api/levels/${levelId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ levelId, answers }),
  });
}
