import { join } from 'node:path';
import { readJSONSync } from 'fs-extra';
import { MusicData, musicDataPath } from './common';

export const music: MusicData = readJSONSync(join(musicDataPath, 'data.json'));
export const music_sp: MusicData = readJSONSync(join(musicDataPath, 'data_sp.json'));
export const cmusic: MusicData = readJSONSync(join(musicDataPath, 'cdata.json'));
export const getJaket = (id: number | string) => join(musicDataPath, `${id}.png`);

interface SortedMusicEntry {
  id: string;
  diff: number;
  level: number;
}

export const sortedMusic = Object.entries(music)
  .flatMap(([id, entry]) => entry.levels.map((level, idx): SortedMusicEntry => ({ id, diff: idx, level })))
  .sort((a, b) => a.level - b.level);

export * from './common';
