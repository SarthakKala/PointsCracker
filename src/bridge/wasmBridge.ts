import type { Card, CalculationResult, WasmModule } from '../types';

type CalculatorModuleFactory = (
  options?: { locateFile?: (file: string) => string },
) => Promise<WasmModule>;

declare global {
  interface Window {
    CalculatorModule?: CalculatorModuleFactory;
  }
}

let module: WasmModule | null = null;
let calculateFn: ((...args: number[]) => string) | null = null;

function loadCalculatorScript(): Promise<void> {
  const src = '/calculator.js';

  return new Promise((resolve, reject) => {
    if (window.CalculatorModule) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load calculator engine')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load calculator engine'));
    document.head.appendChild(script);
  });
}

export async function initWasm(): Promise<void> {
  await loadCalculatorScript();

  const CalculatorModule = window.CalculatorModule;
  if (!CalculatorModule) {
    throw new Error('CalculatorModule not found — run npm run build:wasm');
  }

  const wasm = await CalculatorModule({
    locateFile: (file: string) => `/${file}`,
  });
  module = wasm;

  calculateFn = wasm.cwrap('calculate', 'string', [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
  ]) as (...args: number[]) => string;
}

export function isWasmReady(): boolean {
  return module !== null && calculateFn !== null;
}

export function calculatePoints(card: Card, points: number): CalculationResult {
  if (!calculateFn) throw new Error('WASM not initialised');

  const { cashback, flights, hotels, shopping, statementCredit } = card.redemptionRates;

  const resultJson = calculateFn(
    cashback,
    flights,
    hotels,
    shopping,
    statementCredit,
    points,
    card.minRedemptionPoints,
    card.expiryMonths,
  );

  return JSON.parse(resultJson) as CalculationResult;
}
