import { readFile } from 'node:fs/promises';
import { pathExists, writeJSON } from 'fs-extra';
import { exec } from 'node:child_process';
import { join } from 'node:path';
import { globIterate } from 'glob';
import { type INode, parse, walk } from '@sibot/xml';
import { htmlUnescape } from 'escape-goat';
import { paths } from './config';
import { MusicData, musicDataPath } from './common';

const data: MusicData = {};

async function addOption(path: string) {
  if (await pathExists(join(path, 'music'))) {
    for await (let musicPath of globIterate(join(path, 'music', '*/'))) {
      const content = parse(await readFile(join(musicPath, 'Music.xml'), 'utf8'));

      // data
      let id: number, name: string, artist: string;
      const levels: number[] = [];
      let jaket: string;
      walk(content, (node) => {
        if (typeof node !== 'string') {
          if (node.tagName === 'name') {
            id = parseInt((node.children[0] as INode).children[0] as string);
            name = htmlUnescape((node.children[1] as INode).children[0] as string);
          }
          if (node.tagName === 'artistName') {
            artist = htmlUnescape((node.children[1] as INode).children[0] as string);
          }
          if (node.tagName === 'jaketFile') {
            jaket = (node.children[0] as INode).children[0] as string;
          }
          if (
            node.tagName === 'MusicFumenData' &&
            (node.children[1] as INode) /* enable */.children[0] === 'true'
          ) {
            const idx = parseInt(
              ((node.children[0] as INode) /* type */.children[0] as INode) /* id */
                .children[0] as string
            );
            const level = parseInt((node.children[3] as INode) /* level */.children[0] as string);
            const levelDecimal = parseInt(
              (node.children[4] as INode) /* level */.children[0] as string
            );
            if (level !== 0) levels[idx] = level * 100 + levelDecimal;
          }
        }
      });
      if (data[id])
        data[id].levels = data[id].levels.length > levels.length ? data[id].levels : levels;
      else
        data[id] = {
          name,
          artist,
          levels,
        };

      // image
      exec(`magick convert ${join(musicPath, jaket)} ${join(musicDataPath, `${id}.png`)}`);
    }
  }
}

async function main() {
  await Promise.all(paths.map((path) => addOption(path)));

  await writeJSON(join(musicDataPath, 'data.json'), data);
}

main();
