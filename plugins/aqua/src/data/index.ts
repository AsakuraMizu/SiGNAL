import { join } from 'node:path';
import { readJSONSync } from 'fs-extra';
import { MusicData, musicDataPath } from './common';

export const music: MusicData = readJSONSync(join(musicDataPath, 'data.json'));
export const music_sp: MusicData = readJSONSync(join(musicDataPath, 'data_sp.json'));
export const cmusic: MusicData = readJSONSync(join(musicDataPath, 'cdata.json'));
export const getJaket = (id: number | string) => join(musicDataPath, `${id}.png`);

export * from './common';
