export function renderExpiryWarning(
  container: HTMLElement,
  show: boolean,
  expiryMonths: number,
): void {
  if (!show) {
    container.classList.add('hidden');
    container.replaceChildren();
    return;
  }

  const monthsLabel =
    expiryMonths === 1 ? '1 month' : `${expiryMonths} months`;

  container.classList.remove('hidden');
  container.replaceChildren();
  container.textContent = `⚠️ Your points expire within ${monthsLabel}. Redeem before they disappear.`;
}
