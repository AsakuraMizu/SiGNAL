import { join } from 'node:path';

export interface MusicDataEntry {
  name: string;
  artist: string;
  levels: number[];
}

export interface MusicData {
  [id: string]: MusicDataEntry;
}

export const musicDataPath = join(__dirname, 'music');
