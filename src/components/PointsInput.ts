const MAX_POINTS = 10_000_000;

export function renderPointsInput(
  container: HTMLElement,
  onChange: (points: number) => void,
): void {
  const label = document.createElement('label');
  label.className = 'field-label';
  label.htmlFor = 'points-input';
  label.textContent = 'Points balance';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.id = 'points-input';
  input.className = 'points-input';
  input.placeholder = '0';
  input.autocomplete = 'off';

  const error = document.createElement('p');
  error.className = 'input-error hidden';
  error.setAttribute('role', 'alert');

  const capNote = document.createElement('p');
  capNote.className = 'input-note hidden';

  function setError(message: string): void {
    if (message) {
      error.textContent = message;
      error.classList.remove('hidden');
      input.classList.add('input-invalid');
    } else {
      error.textContent = '';
      error.classList.add('hidden');
      input.classList.remove('input-invalid');
    }
  }

  input.addEventListener('input', () => {
    const raw = input.value.trim();
    capNote.classList.add('hidden');

    if (raw === '') {
      setError('');
      onChange(0);
      return;
    }

    if (!/^\d*\.?\d*$/.test(raw) || raw === '.') {
      setError('Enter a valid number of points.');
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Points cannot be negative.');
      return;
    }

    let points = Math.floor(parsed);
    if (points > MAX_POINTS) {
      points = MAX_POINTS;
      input.value = String(MAX_POINTS);
      capNote.textContent = `Maximum ${MAX_POINTS.toLocaleString('en-IN')} points.`;
      capNote.classList.remove('hidden');
    }

    setError('');
    onChange(points);
  });

  container.replaceChildren(label, input, error, capNote);
}
