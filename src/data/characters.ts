import type { CharacterId, GameMode } from '../game/core/types';

export interface PlayableCharacter {
  id: CharacterId;
  name: string;
  role: string;
  description: string;
  mode: GameMode;
  accent: string;
  symbol: string;
}

export const characters: PlayableCharacter[] = [
  { id: 'jahvante', name: 'Jahvantè', role: 'The Developer', description: 'Follow the trail of ideas through a colorful village.', mode: 'village', accent: '#81d7a0', symbol: 'J' },
  { id: 'wife', name: 'The Adventurer', role: 'The Explorer', description: 'Discover the projects together, one house at a time.', mode: 'village', accent: '#d0a7df', symbol: 'W' },
  { id: 'nea', name: 'Nea', role: 'The Cat', description: 'A four-pawed journey through the little town.', mode: 'village', accent: '#e9c48d', symbol: 'N' },
  { id: 'knight', name: 'The Black Knight', role: 'Volcanic Adventure', description: 'Six battles. Six discoveries. One résumé guardian.', mode: 'volcano', accent: '#ff786b', symbol: 'K' },
];
