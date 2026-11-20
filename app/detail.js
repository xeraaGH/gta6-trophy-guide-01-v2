// The per-trophy detail panel: official name, description and grade, the roadmap
// stage, the "Can it be missed?" verdict, the guide, per-fact citations, the
// own-advice flag, and the sources the facts came from.
import { KIND_LABELS } from './checklist.js';

function verdictClass(verdict) {
  if (verdict.startsWith('Yes')) return 'yes';
  if (verdict.startsWith('Unknown')) return 'unknown';
  return 'no';
}

export function renderDetail(panel, trophy, earned) {
  panel.replaceChildren();
  if (!trophy) {
    const p = document.createElement('p');
    p.textContent = 'Pick a trophy from the checklist to see its guide, its missable verdict and its sources.';
    panel.append(p);
    return;
  }
  const hiddenStory = trophy.story && !earned.has(trophy.name) && document.getElementById('spoiler-toggle').checked;
  const title = document.createElement('h2');
  title.textContent = hiddenStory ? 'Hidden story trophy' : trophy.name;
  panel.append(title);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hiddenStory ? 'Hidden story trophy — earn it to reveal.' : trophy.description;
  panel.append(desc);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = `grade-chip ${trophy.grade}`;
  grade.textContent = trophy.grade;
  meta.append(grade);
  const stage = document.createElement('span');
  stage.className = 'stage-chip';
  stage.textContent = `Roadmap stage ${trophy.stage}`;
  meta.append(stage);
  const kind = document.createElement('span');
  kind.className = 'kind-chip-label';
  kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  meta.append(kind);
  panel.append(meta);

  if (hiddenStory) {
    const note = document.createElement('p');
    note.className = 'hidden-story';
    note.textContent = 'This is a story trophy. Turn off “Hide story spoilers” or earn it to see its guide.';
    panel.append(note);
    return;
  }

  // The missable verdict: every trophy answers "Can it be missed?" directly.
  const verdict = document.createElement('div');
  verdict.className = `missable-verdict ${verdictClass(trophy.missable_verdict)}`;
  const verdictTitle = document.createElement('strong');
  verdictTitle.textContent = `Can it be missed? ${trophy.missable_verdict}`;
  const verdictReason = document.createElement('span');
  verdictReason.textContent = trophy.missable_reason;
  verdict.append(verdictTitle, verdictReason);
  panel.append(verdict);

  if (trophy.unconfirmed) {
    const warn = document.createElement('div');
    warn.className = 'unconfirmed-warning';
    warn.textContent = 'Method not yet confirmed: no reliable guide has confirmed how this trophy unlocks. The guide below gives the best lead and says plainly what is unconfirmed — it never presents a guess as fact.';
    panel.append(warn);
  }

  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'How to get it';
  panel.append(guideTitle);
  const guide = document.createElement('p');
  guide.textContent = trophy.guide;
  panel.append(guide);

  if (trophy.facts && trophy.facts.length > 0) {
    const factsTitle = document.createElement('h3');
    factsTitle.textContent = 'Facts behind this guide';
    panel.append(factsTitle);
    const facts = document.createElement('ul');
    facts.className = 'fact-list';
    for (const fact of trophy.facts) {
      const li = document.createElement('li');
      li.textContent = `${fact.text} — `;
      const src = document.createElement('span');
      src.className = 'fact-source';
      src.textContent = fact.source;
      li.append(src);
      facts.append(li);
    }
    panel.append(facts);
  }

  if (trophy.own_advice) {
    const advice = document.createElement('p');
    advice.className = 'own-advice';
    advice.textContent = trophy.own_advice;
    panel.append(advice);
  }

  const sourcesTitle = document.createElement('h3');
  sourcesTitle.textContent = 'Sources for this guide';
  panel.append(sourcesTitle);
  const sources = document.createElement('ul');
  sources.className = 'source-list';
  for (const s of trophy.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    sources.append(li);
  }
  panel.append(sources);
}
