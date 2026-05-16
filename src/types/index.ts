export interface RedemptionRates {
  cashback: number;
  flights: number;
  hotels: number;
  shopping: number;
  statementCredit: number;
}

export interface BonusCategory {
  category: string;
  multiplier: number;
}

export interface Card {
  id: string;
  name: string;
  bank: string;
  pointsPerRupee: number;
  expiryMonths: number;
  minRedemptionPoints: number;
  redemptionRates: RedemptionRates;
  bonusCategories: BonusCategory[];
  cappedAt: number | null;
  notes: string;
}

export interface CalculationResult {
  cashback: number;
  flights: number;
  hotels: number;
  shopping: number;
  statementCredit: number;
  bestOption: string;
  bestValue: number;
  expiryWarning: boolean;
  belowMinimum: boolean;
}

export interface WasmModule {
  cwrap: (name: string, returnType: string, argTypes: string[]) => Function;
  UTF8ToString: (ptr: number) => string;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  stringToUTF8: (str: string, ptr: number, maxBytes: number) => void;
  lengthBytesUTF8: (str: string) => number;
}
