import cardsData from './cards.json';
import type { Card } from '../types';

const cards: Card[] = cardsData.cards;

export function getAllCards(): Card[] {
  return cards;
}

export function getCardById(id: string): Card | undefined {
  return cards.find((card) => card.id === id);
}

export function getCardsByBank(bank: string): Card[] {
  return cards.filter((card) => card.bank === bank);
}
