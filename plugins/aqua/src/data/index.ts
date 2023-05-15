import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readJSONSync } from 'fs-extra';
import { MusicData, musicDataPath } from './common';

export const music: MusicData = readJSONSync(join(musicDataPath, 'data.json'));
export const getJaket = (id: number | string) => join(musicDataPath, `${id}.png`);

export * from './common';
