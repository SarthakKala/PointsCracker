import type { Card, CalculationResult, WasmModule } from '../types';

let module: WasmModule | null = null;
let calculateFn: ((...args: number[]) => string) | null = null;

export async function initWasm(): Promise<void> {
  // Emscripten glue is emitted to public/ by `make build` (not part of the TS program).
  // @ts-expect-error — runtime asset at /calculator.js
  const CalculatorModule = (await import('/calculator.js')).default as (
    options?: { locateFile?: (file: string) => string },
  ) => Promise<WasmModule>;
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
