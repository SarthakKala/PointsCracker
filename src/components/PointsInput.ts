const MAX_POINTS = 10_000_000;

function formatWithCommas(value: number): string {
  return value.toLocaleString('en-IN');
}

function parseDigits(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return 0;
  return parseInt(digits, 10);
}

function moveCursorToEnd(input: HTMLInputElement): void {
  requestAnimationFrame(() => {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

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
  input.dir = 'ltr';

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

  function applyValue(points: number, showCapNote: boolean): void {
    input.value = points > 0 ? formatWithCommas(points) : '';
    if (showCapNote) {
      capNote.textContent = `Maximum ${formatWithCommas(MAX_POINTS)} points.`;
      capNote.classList.remove('hidden');
    } else {
      capNote.classList.add('hidden');
    }
    setError('');
    onChange(points);
    moveCursorToEnd(input);
  }

  input.addEventListener('focus', () => moveCursorToEnd(input));
  input.addEventListener('click', () => moveCursorToEnd(input));

  input.addEventListener('input', () => {
    const digitsOnly = input.value.replace(/\D/g, '');

    if (digitsOnly === '') {
      input.value = '';
      capNote.classList.add('hidden');
      setError('');
      onChange(0);
      return;
    }

    let points = parseDigits(digitsOnly);
    let capped = false;

    if (points > MAX_POINTS) {
      points = MAX_POINTS;
      capped = true;
    }

    applyValue(points, capped);
  });

  container.replaceChildren(label, input, error, capNote);
}
