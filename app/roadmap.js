// The Roadmap to Platinum: five stages, each naming the trophies it covers,
// plus the 100% Completion counters with steppers that save in this browser.
import { saveCounters } from './storage.js';

export const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Story: Chapters 1–2, and the one thing to do early',
    text: 'Play the story. Do the Chapter 1 meditation at Jason’s house during Chapter 1 (see Positive Mental Attitude) — it may be the only missable thing in the game. Try the activities once for Master of None.',
  },
  {
    n: 2,
    title: 'Stage 2 — Story: Chapters 3–4 and the finale',
    text: 'Finish the story. Robberies, wanted-level and combat trophies come naturally here; Strength training for Personal Best starts after the Chapter 2 mission Coffee Break.',
  },
  {
    n: 3,
    title: 'Stage 3 — Strangers and side content',
    text: 'Work the stranger mission strands (Andy, Kenton, Billy, Randy, Tyrone, Bret), hunt with Bret, steal the Rhino tank, and explore all 52 areas of Leonida.',
  },
  {
    n: 4,
    title: 'Stage 4 — Collectibles and the activity grind',
    text: 'Cards, WAiNK It spots, vehicles, garages, the Shooting Range golds, drone races, stunts and Challenges. The four trophies with no confirmed method sit here — check them again once a guide confirms them.',
  },
  {
    n: 5,
    title: 'Stage 5 — 100% Completion and the Platinum',
    text: 'Finish the A Long Road checklist with the counters below, then the Platinum (Vice Got a Price!) unlocks automatically.',
  },
];

export const COUNTERS = [
  { key: 'vaults', label: 'Bank Vaults robbed', target: 8 },
  { key: 'gangops', label: 'Gang Operations robbed', target: 39 },
  { key: 'range', label: 'Shooting Range gold medals', target: 42 },
  { key: 'drones', label: 'Top Fun Drone Race wins', target: 14 },
  { key: 'decks', label: 'Bret’s Target Decks', target: 15 },
  { key: 'missions', label: 'Optional Missions', target: 100 },
  { key: 'stunts', label: 'Stunts', target: 300 },
  { key: 'challenges', label: 'Challenges', target: 70 },
];

export function renderRoadmap(container, trophies) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const box = document.createElement('div');
    box.className = 'roadmap-stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    const members = trophies.filter((t) => t.stage === stage.n);
    names.textContent = members.map((t) => `${t.name} (${t.grade})`).join(', ');
    box.append(h, p, names);
    container.append(box);
  }
}

export function renderCounters(container, counters, onChange) {
  container.replaceChildren();
  for (const c of COUNTERS) {
    const value = Math.max(0, Math.min(c.target, counters[c.key] ?? 0));
    const box = document.createElement('div');
    box.className = 'collectible-counter';
    const label = document.createElement('strong');
    label.textContent = c.label;
    const stepper = document.createElement('div');
    stepper.className = 'stepper';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', `Decrease ${c.label}`);
    minus.addEventListener('click', () => {
      counters[c.key] = Math.max(0, (counters[c.key] ?? 0) - 1);
      saveCounters(counters);
      onChange();
    });
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `${value} of ${c.target}`;
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Increase ${c.label}`);
    plus.addEventListener('click', () => {
      counters[c.key] = Math.min(c.target, (counters[c.key] ?? 0) + 1);
      saveCounters(counters);
      onChange();
    });
    stepper.append(minus, count, plus);
    box.append(label, stepper);
    container.append(box);
  }
}
