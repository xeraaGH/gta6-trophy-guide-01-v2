// Leonida Trophy Guide — bootstrap: loads the trophy data, routes by URL hash,
// and wires the checklist, roadmap, missables and detail views together.
import {
  loadEarned, saveEarned, loadCounters, loadSpoilers, saveSpoilers,
  exportProgress, importProgress, DEMO_EARNED,
} from './storage.js';
import { buildKindFilters, renderChecklist, updateProgress } from './checklist.js';
import { renderDetail } from './detail.js';
import { renderRoadmap, renderCounters } from './roadmap.js';
import { renderMissables } from './missables.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

const params = new URLSearchParams(location.hash.slice(1));
let demo = params.get('demo') === 'progress';
const state = {
  earned: demo ? new Set(DEMO_EARNED) : loadEarned(),
  counters: loadCounters(),
  spoilers: params.get('spoilers') ? params.get('spoilers') !== 'off' : loadSpoilers(),
  view: params.get('view') ?? 'checklist',
  kind: params.get('filter') ?? 'all',
  grade: params.get('grade') ?? 'all',
  earnedFilter: 'all',
  query: '',
  selected: params.get('trophy') ?? 'Catch Me If You Can',
};

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const kindEl = document.getElementById('kind-filters');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const earnedEl = document.getElementById('earned-filter');
const spoilerEl = document.getElementById('spoiler-toggle');

function selectedTrophy() {
  return trophies.find((t) => t.name === state.selected) ?? null;
}

function showView(view) {
  state.view = view;
  for (const v of ['checklist', 'roadmap', 'missables']) {
    document.getElementById(`view-${v}`).hidden = v !== view;
    document.getElementById(`tab-${v}`).classList.toggle('active', v === view);
  }
  if (view === 'roadmap') {
    renderRoadmap(document.getElementById('roadmap-stages'), trophies);
    const countersEl = document.getElementById('collectible-counters');
    const drawCounters = () => renderCounters(countersEl, state.counters, drawCounters);
    drawCounters();
  }
  if (view === 'missables') {
    renderMissables(document.getElementById('missables-list'), trophies, (name) => {
      state.selected = name;
      showView('checklist');
      refresh();
    });
  }
  syncHash();
}

function refresh() {
  buildKindFilters(kindEl, state.kind, (kind) => { state.kind = kind; refresh(); });
  renderChecklist(listEl, trophies, state, (name) => { state.selected = name; refresh(); });
  renderDetail(detailEl, selectedTrophy(), state.earned);
  updateProgress(trophies, state.earned);
  searchEl.value = state.query;
  gradeEl.value = state.grade;
  earnedEl.value = state.earnedFilter;
  spoilerEl.checked = state.spoilers;
  syncHash();
}
state.refresh = refresh;

function syncHash() {
  const p = new URLSearchParams();
  p.set('view', state.view);
  if (state.selected) p.set('trophy', state.selected);
  if (state.kind !== 'all') p.set('filter', state.kind);
  if (state.grade !== 'all') p.set('grade', state.grade);
  p.set('spoilers', state.spoilers ? 'on' : 'off');
  if (demo) p.set('demo', 'progress');
  history.replaceState(null, '', `#${p.toString()}`);
}

for (const v of ['checklist', 'roadmap', 'missables']) {
  document.getElementById(`tab-${v}`).addEventListener('click', () => showView(v));
}
searchEl.addEventListener('input', () => { state.query = searchEl.value; refresh(); });
gradeEl.addEventListener('change', () => { state.grade = gradeEl.value; refresh(); });
earnedEl.addEventListener('change', () => { state.earnedFilter = earnedEl.value; refresh(); });
spoilerEl.addEventListener('change', () => {
  state.spoilers = spoilerEl.checked;
  if (!demo) saveSpoilers(state.spoilers);
  refresh();
});
document.getElementById('export-progress').addEventListener('click', () => {
  if (demo) return;
  exportProgress(state.earned, state.counters);
});
document.getElementById('import-progress').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file || demo) return;
  const data = await importProgress(file);
  state.earned = data.earned;
  state.counters = data.counters;
  saveEarned(state.earned);
  refresh();
});

refresh();
showView(state.view);

// Deep links: re-apply the hash when it changes (back/forward, or a link
// into a view), so a hash-only navigation re-renders the app.
window.addEventListener('hashchange', () => {
  const p = new URLSearchParams(location.hash.slice(1));
  const newDemo = p.get('demo') === 'progress';
  if (newDemo !== demo) {
    demo = newDemo;
    state.earned = demo ? new Set(DEMO_EARNED) : loadEarned();
  }
  state.view = p.get('view') ?? 'checklist';
  state.kind = p.get('filter') ?? 'all';
  state.grade = p.get('grade') ?? 'all';
  state.spoilers = p.get('spoilers') ? p.get('spoilers') !== 'off' : state.spoilers;
  state.selected = p.get('trophy') ?? state.selected;
  refresh();
  showView(state.view);
});
