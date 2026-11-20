// The trophy checklist: filters by kind and grade, search, earned/not-earned,
// and the spoiler setting that hides story trophies until they are earned.
import { saveEarned } from './storage.js';

export const KINDS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Missable'],
  ['collectibles', 'Collectibles'], ['activities', 'Activities'],
  ['combat', 'Combat'], ['crime', 'Crime'], ['strangers', 'Strangers'],
  ['exploration', 'Exploration'], ['completion', 'Completion'], ['online', 'Online'],
];

export const KIND_LABELS = Object.fromEntries(KINDS);

export function buildKindFilters(container, current, onChange) {
  container.replaceChildren();
  for (const [value, label] of KINDS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kind-chip' + (current === value ? ' active' : '');
    button.textContent = label;
    button.addEventListener('click', () => onChange(value));
    container.append(button);
  }
}

export function trophyMatches(t, { kind, grade, earnedFilter, query, earned }) {
  if (kind !== 'all') {
    if (kind === 'online') return false; // no trophy needs online play
    if (t.kind !== kind) return false;
  }
  if (grade !== 'all' && t.grade !== grade) return false;
  if (earnedFilter === 'earned' && !earned.has(t.name)) return false;
  if (earnedFilter === 'not-earned' && earned.has(t.name)) return false;
  if (query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(query.toLowerCase())) return false;
  }
  return true;
}

export function renderChecklist(listEl, trophies, state, onSelect) {
  listEl.replaceChildren();
  const shown = trophies.filter((t) => trophyMatches(t, state));
  if (state.kind === 'online') {
    const li = document.createElement('li');
    li.className = 'trophy-row';
    li.textContent = 'No trophy needs online play — all 55 are earned offline, so this filter is empty by design.';
    listEl.append(li);
    return;
  }
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'trophy-row';
    li.textContent = 'No trophies match these filters.';
    listEl.append(li);
    return;
  }
  for (const t of shown) {
    const isEarned = state.earned.has(t.name);
    const li = document.createElement('li');
    li.className = 'trophy-row' + (isEarned ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) state.earned.add(t.name);
      else state.earned.delete(t.name);
      saveEarned(state.earned);
      state.refresh();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const body = document.createElement('div');
    const hiddenStory = t.story && state.spoilers && !isEarned;
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = hiddenStory ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = hiddenStory ? 'Hidden story trophy — earn it to reveal.' : t.description;
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const grade = document.createElement('span');
    grade.className = `grade-chip ${t.grade}`;
    grade.textContent = t.grade;
    meta.append(grade);
    const stage = document.createElement('span');
    stage.className = 'stage-chip';
    stage.textContent = `Roadmap stage ${t.stage}`;
    meta.append(stage);
    const kind = document.createElement('span');
    kind.className = 'kind-chip-label';
    kind.textContent = KIND_LABELS[t.kind] ?? t.kind;
    meta.append(kind);
    const miss = document.createElement('span');
    const verdict = t.missable_verdict;
    miss.className = 'missable-chip' + (verdict.startsWith('Yes') ? ' yes' : verdict.startsWith('Unknown') ? ' unknown' : '');
    miss.textContent = verdict.startsWith('Yes') ? 'Missable' : verdict.startsWith('Unknown') ? 'Method unconfirmed' : 'Not missable';
    meta.append(miss);
    if (t.target) {
      const target = document.createElement('span');
      target.className = 'kind-chip-label';
      target.textContent = `${t.target} ${t.target_label}`;
      meta.append(target);
    }
    body.append(name, desc, meta);
    const open = document.createElement('span');
    open.textContent = '›';
    li.append(box, body, open);
    li.addEventListener('click', () => onSelect(t.name));
    listEl.append(li);
  }
}

export function updateProgress(trophies, earned) {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('progress').textContent = `${done} of ${total} earned`;
  document.getElementById('progress-fill').style.width = `${total ? (done / total) * 100 : 0}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.name)) byGrade[t.grade].done += 1;
  }
  const order = ['platinum', 'gold', 'silver', 'bronze'];
  const label = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
  document.getElementById('grade-breakdown').textContent = order
    .map((g) => `${label[g]} ${byGrade[g]?.done ?? 0}/${byGrade[g]?.total ?? 0}`)
    .join(' · ');
}
