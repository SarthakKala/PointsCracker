import './style.css';
import { initWasm, calculatePoints } from './bridge/wasmBridge';
import { getCardById } from './data/loader';
import { renderCardSelector } from './components/CardSelector';
import { renderPointsInput } from './components/PointsInput';
import { renderResults } from './components/ResultsPanel';
import { renderExpiryWarning } from './components/ExpiryWarning';
import type { Card } from './types';

let selectedCard: Card | null = null;
let currentPoints = 0;

const loader = document.querySelector<HTMLElement>('#loader')!;
const calculateBtn = document.querySelector<HTMLButtonElement>('#calculate-btn')!;
const resultsSection = document.querySelector<HTMLElement>('#results-section')!;
const resultsPanel = document.querySelector<HTMLElement>('#results-panel')!;
const expiryWarning = document.querySelector<HTMLElement>('#expiry-warning')!;
const cardSelectorContainer = document.querySelector<HTMLElement>('#card-selector-container')!;
const pointsInputContainer = document.querySelector<HTMLElement>('#points-input-container')!;

function hideLoader(): void {
  loader.classList.add('loader-overlay--hidden');
}

function showLoaderError(message: string): void {
  loader.innerHTML = `<p class="loader-error">${message}</p>`;
}

function clearResults(): void {
  resultsSection.classList.add('hidden');
  resultsPanel.replaceChildren();
  expiryWarning.classList.add('hidden');
  expiryWarning.replaceChildren();
}

function updateCalculateButton(): void {
  calculateBtn.disabled = !(selectedCard && currentPoints > 0);
}

async function init(): Promise<void> {
  try {
    await initWasm();
  } catch {
    showLoaderError('Engine failed to load. Please refresh.');
    return;
  }

  hideLoader();

  renderCardSelector(cardSelectorContainer, (cardId) => {
    selectedCard = getCardById(cardId) ?? null;
    clearResults();
    updateCalculateButton();
  });

  renderPointsInput(pointsInputContainer, (points) => {
    currentPoints = points;
    updateCalculateButton();
  });

  calculateBtn.addEventListener('click', () => {
    if (!selectedCard || currentPoints <= 0) return;

    const result = calculatePoints(selectedCard, currentPoints);

    renderResults(resultsPanel, result, selectedCard.name, currentPoints);
    renderExpiryWarning(
      expiryWarning,
      result.expiryWarning,
      selectedCard.expiryMonths,
    );

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

init();
