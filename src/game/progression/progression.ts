import type { PortfolioId } from '../core/types';

/** One encounter per portfolio room, then the résumé guardian. */
export const encounterOrder: PortfolioId[] = [
  'projects', 'experience', 'skills', 'about', 'credentials', 'contact',
];

export function sectionForVictory(defeatedNormalEnemies: number): PortfolioId | null {
  return encounterOrder[defeatedNormalEnemies] ?? null;
}

export function isBossEncounter(defeatedNormalEnemies: number): boolean {
  return defeatedNormalEnemies >= encounterOrder.length;
}
