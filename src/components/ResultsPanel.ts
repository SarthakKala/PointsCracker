import type { CalculationResult } from '../types';

const CATEGORY_META: Record<
  keyof Pick<
    CalculationResult,
    'cashback' | 'flights' | 'hotels' | 'shopping' | 'statementCredit'
  >,
  { label: string; icon: string }
> = {
  cashback: { label: 'Cashback', icon: '💳' },
  flights: { label: 'Flights', icon: '✈️' },
  hotels: { label: 'Hotels', icon: '🏨' },
  shopping: { label: 'Shopping vouchers', icon: '🛍️' },
  statementCredit: { label: 'Statement credit', icon: '📄' },
};

function formatRupee(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function renderResults(
  container: HTMLElement,
  result: CalculationResult,
  cardName: string,
  points: number,
): void {
  container.replaceChildren();

  const showBestBadge = points > 0 && !result.belowMinimum && result.bestValue > 0;

  const summary = document.createElement('p');
  summary.className = 'results-summary';
  summary.innerHTML = `Your <span class="results-points">${points.toLocaleString('en-IN')}</span> points on <strong>${cardName}</strong> are worth up to <span class="results-best">${formatRupee(result.bestValue)}</span>`;
  container.appendChild(summary);

  if (result.belowMinimum) {
    const warning = document.createElement('p');
    warning.className = 'results-warning';
    warning.textContent = 'Below minimum redemption — earn more points before redeeming.';
    container.appendChild(warning);
  }

  const list = document.createElement('div');
  list.className = `results-list${result.belowMinimum ? ' results-list--muted' : ''}`;

  const rows = (
    Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>
  )
    .map((key) => ({
      key,
      value: result[key],
      ...CATEGORY_META[key],
    }))
    .sort((a, b) => b.value - a.value);

  for (const row of rows) {
    const el = document.createElement('div');
    const isBest = showBestBadge && row.key === result.bestOption;
    el.className = `result-row${isBest ? ' result-row--best' : ''}`;

    const left = document.createElement('div');
    left.className = 'result-row-left';
    left.innerHTML = `<span class="result-icon" aria-hidden="true">${row.icon}</span><span class="result-label">${row.label}</span>`;

    const right = document.createElement('div');
    right.className = 'result-row-right';
    right.innerHTML = `<span class="result-value">${formatRupee(row.value)}</span>`;
    if (isBest) {
      const badge = document.createElement('span');
      badge.className = 'best-badge';
      badge.textContent = 'BEST VALUE';
      right.prepend(badge);
    }

    el.append(left, right);
    list.appendChild(el);
  }

  container.appendChild(list);
}
