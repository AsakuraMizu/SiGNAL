import { join } from 'node:path';
import { createCanvas, loadImage, type Image } from 'canvas';
import { getJaket, type MusicData } from '../data';
import { levelNamesShort } from '../utils';
import { getRank } from '../utils';
import { RequiredB30Item, RequiredR10Item, calc } from './calc';

function asset(name: string) {
  return join(__dirname, '..', 'assets', name);
}

async function loadJaket(id: number | string) {
  return await loadImage(getJaket(id));
}

export interface RequiredUserData {
  // accessCode: string;
  userName: string;
  level: string;
  // exp: string;
  // totelPoint: string;
  // playCount: string;
  playerRating: string;
  highestRating: string;
  // nameplateId: string;
  // frameId: string;
  // characterId: string;
  // trophyId: string;
  // totalMapNum: string;
  // totalHiScore: string;
  // friendCount: string;
  // lastGameId: string;
  // lastRomVersion: string;
  // lastDataVersion: string;
  // lastPlayDate: string;
}

export async function draw(
  music: MusicData,
  data: RequiredUserData,
  b30: RequiredB30Item[],
  r10: RequiredR10Item[],
  calc_rating = false
) {
  const { b30avg, r10avg, rating } = calc(b30, r10);

  const ranks = Object.fromEntries(
    await Promise.all(
      ['SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'C', 'D'].map(
        async (rank): Promise<[string, Image]> => [rank, await loadImage(asset(`ranks/${rank}.png`))]
      )
    )
  );
  const aj = await loadImage(asset('ALLJUSTICE.png'));
  const fc = await loadImage(asset('FULLCOMBO.png'));

  const canvas = createCanvas(1470, 1450);
  const ctx = canvas.getContext('2d');
  const fontname = '"Noto Sans CJK JP Medium"';

  ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 1;

  // bg
  ctx.drawImage(await loadImage(asset('base.png')), 0, 0);

  // user info
  ctx.font = '24px ' + fontname;
  ctx.fillText(data.level, 202, 65 + 18);
  if (calc_rating) ctx.fillText(rating, 241, 106 + 22);
  else if (data.highestRating === '-1')
    ctx.fillText(`${(parseFloat(data.playerRating) / 100).toFixed(2)}`, 241, 106 + 22);
  else
    ctx.fillText(
      `${(parseFloat(data.playerRating) / 100).toFixed(2)} (Max ${(parseFloat(data.highestRating) / 100).toFixed(2)})`,
      241,
      106 + 22
    );

  ctx.font = '41px ' + fontname;
  ctx.fillText(data.userName, 246, 47 + 38);

  // b30 & r10
  ctx.font = 'bold 32px ' + fontname;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(b30avg, 158, 204 + 25);
  ctx.fillText(r10avg, 158, 1070 + 25);
  ctx.fillStyle = '#000000';

  const xs = [45, 324, 606, 884, 1164];
  const colors = ['#00a883', '#ec7500', '#de2526', '#8e1ae6', '#150000'];

  const drawEntry = async (
    e: {
      musicId: string;
      level: string;
      score: string;
      aj: boolean;
      fc: boolean;
      rating: number;
    },
    i: number,
    bx: number,
    by: number
  ) => {
    if (e.level === '5') return;

    const m = music[e.musicId];
    if (!m) {
      console.log(e.musicId);
      return;
    }
    const lvl = (m.levels[e.level] / 100).toFixed(1);
    const ra = (e.rating / 100).toFixed(2);
    const rank = getRank(parseInt(e.score));

    ctx.drawImage(await loadJaket(e.musicId), bx, by, 105, 105);

    ctx.font = '14px ' + fontname;
    ctx.textAlign = 'center';
    ctx.fillText(m.name, bx + 110 + 148 / 2, by + 6 + 14, 148);
    ctx.textAlign = 'left';

    ctx.beginPath();
    ctx.moveTo(bx + 114, by + 28);
    ctx.lineTo(bx + 114 + 142, by + 28);
    ctx.stroke();

    ctx.font = '28px ' + fontname;
    ctx.fillText(e.score.padStart(7, ' '), bx + 130, by + 33 + 23);

    ctx.fillStyle = colors[e.level];
    ctx.fillRect(bx + 115, by + 64, 140, 20);
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(bx + 114, by + 63, 142, 22);
    ctx.strokeStyle = '#000000';

    ctx.font = '16px ' + fontname;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${levelNamesShort[e.level]}${lvl} → ${ra}`, bx + 121, by + 67 + 13);
    ctx.fillStyle = '#000000';

    ctx.drawImage(ranks[rank], bx + 115, by + 90, 58, 11);
    if (e.aj || e.fc) ctx.drawImage(e.aj ? aj : fc, bx + 176, by + 90, 58, 11);

    ctx.font = '12px ' + fontname;
    ctx.fillText(`#${i + 1}`, bx + 237, by + 91 + 10);
  };

  await Promise.all([
    ...b30.map(async ({ musicId, level, scoreMax: score, isAllJustice, isFullCombo, rating }, i) => {
      const l = Math.floor(i / 5),
        c = i % 5;
      const bx = xs[c],
        by = 252 + 132 * l;

      drawEntry(
        {
          musicId,
          level,
          score,
          aj: isAllJustice === 'true',
          fc: isFullCombo === 'true',
          rating,
        },
        i,
        bx,
        by
      );
    }),
    ...r10.map(async ({ musicId, difficultId: level, score, rating }, i) => {
      if (level === '5') return;

      const l = Math.floor(i / 5),
        c = i % 5;
      const bx = xs[c],
        by = 1120 + 132 * l;

      drawEntry(
        {
          musicId,
          level,
          score,
          aj: false,
          fc: false,
          rating,
        },
        i,
        bx,
        by
      );
    }),
  ]);

  // footer
  ctx.font = '24px ' + fontname;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Generated By KitaBot / Designed by eastown / Supported by AsakuraMizu', 32, 1406 + 27);
  ctx.fillStyle = '#000000';

  return canvas.toDataURL();
}
