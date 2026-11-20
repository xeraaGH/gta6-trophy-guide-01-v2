// The dedicated Missables view: the one trophy that can be missed, the four
// whose method is unconfirmed, and the count of the fifty that are not missable.
export function renderMissables(container, trophies, onSelect) {
  container.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  const unconfirmed = trophies.filter((t) => t.unconfirmed);
  const safe = trophies.filter((t) => !t.missable && !t.unconfirmed);
  const head = document.createElement('p');
  head.textContent = `${missable.length} trophy can be missed · ${unconfirmed.length} have no confirmed method yet · ${safe.length} are not missable.`;
  container.append(head);
  for (const t of missable) {
    container.append(missableCard(t, 'Missable — act in Chapter 1', onSelect));
  }
  for (const t of unconfirmed) {
    container.append(missableCard(t, 'Method unconfirmed', onSelect));
  }
  const safeNote = document.createElement('p');
  safeNote.textContent = `The other ${safe.length} trophies are not missable: story trophies unlock automatically, and every activity, collectible and robbery can be done in free roam after the story. Each trophy's detail panel answers “Can it be missed?” directly.`;
  container.append(safeNote);
}

function missableCard(t, tag, onSelect) {
  const card = document.createElement('div');
  card.className = 'missable-card';
  const h = document.createElement('h3');
  h.textContent = t.name;
  const verdict = document.createElement('p');
  verdict.textContent = `Can it be missed? ${t.missable_verdict} — ${t.missable_reason}`;
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const chip = document.createElement('span');
  chip.className = 'missable-chip ' + (t.missable ? 'yes' : 'unknown');
  chip.textContent = tag;
  card.append(h, chip, verdict, guide);
  card.addEventListener('click', () => onSelect(t.name));
  return card;
}
