import type { CalculationResult } from '../types';
import { CATEGORY_ICONS } from './categoryIcons';

const CATEGORY_META: Record<
  keyof Pick<
    CalculationResult,
    'cashback' | 'flights' | 'hotels' | 'shopping' | 'statementCredit'
  >,
  { label: string }
> = {
  cashback: { label: 'Cashback' },
  flights: { label: 'Flights' },
  hotels: { label: 'Hotels' },
  shopping: { label: 'Shopping vouchers' },
  statementCredit: { label: 'Statement credit' },
};

function formatRupee(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function createCategoryIcon(categoryKey: string): HTMLElement {
  const span = document.createElement('span');
  span.className = 'result-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = CATEGORY_ICONS[categoryKey] ?? CATEGORY_ICONS.cashback;
  return span;
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
    left.append(createCategoryIcon(row.key));

    const labelEl = document.createElement('span');
    labelEl.className = 'result-label';
    labelEl.textContent = row.label;
    left.append(labelEl);

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
