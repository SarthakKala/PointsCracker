import { getAllCards } from '../data/loader';

export function renderCardSelector(
  container: HTMLElement,
  onChange: (cardId: string) => void,
): void {
  const cards = getAllCards();
  const byBank = new Map<string, typeof cards>();

  for (const card of cards) {
    const group = byBank.get(card.bank) ?? [];
    group.push(card);
    byBank.set(card.bank, group);
  }

  const banks = [...byBank.keys()].sort((a, b) => a.localeCompare(b));

  const label = document.createElement('label');
  label.className = 'field-label';
  label.htmlFor = 'card-select';
  label.textContent = 'Your credit card';

  const select = document.createElement('select');
  select.id = 'card-select';
  select.className = 'card-select';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select your card';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  for (const bank of banks) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = bank;
    const bankCards = byBank.get(bank)!.slice().sort((a, b) => a.name.localeCompare(b.name));

    for (const card of bankCards) {
      const option = document.createElement('option');
      option.value = card.id;
      option.textContent = card.name;
      optgroup.appendChild(option);
    }

    select.appendChild(optgroup);
  }

  select.addEventListener('change', () => {
    if (select.value) onChange(select.value);
  });

  container.replaceChildren(label, select);
}
