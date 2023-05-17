import { writeJSON } from 'fs-extra';
import { exec } from 'node:child_process';
import { join } from 'node:path';
import got from 'got';
import { MusicData, musicDataPath } from './common';

interface DFishMusicDataEntry {
  id: number;
  title: string;
  ds: number[];
  basic_info: {
    artist: string;
    genre: string;
    bpm: number;
    from: string;
  };
}

async function main() {
  const dfdata = await got('https://www.diving-fish.com/api/chunithmprober/music_data').json<DFishMusicDataEntry[]>();

  const cdata = dfdata.reduce((prev, entry) => {
    prev[entry.id] = {
      name: entry.title,
      artist: entry.basic_info.artist,
      levels: entry.ds.map((x) => x * 100),
    };
    return prev;
  }, {} as MusicData);

  await writeJSON(join(musicDataPath, 'cdata.json'), cdata);
}

main();
