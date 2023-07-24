import type { Context } from 'koishi';

export type GameVer = 'cn' | 'hdd' | 'jp';

export interface RatingItemInput {
  musicId: number;
  diff: number;
  score: number;
  fc?: boolean;
  aj?: boolean;
}

export interface RatingItem extends RatingItemInput {
  rating: number;
  levelBase: number;
}

export async function calcRatingList(
  chuniData: Context['chuniData'],
  list: RatingItemInput[],
  limit: number,
  gamever: GameVer
) {
  const { data, error } = await chuniData.rpc('query_records', {
    records: list.map(({ musicId, diff }) => ({
      music_id: musicId,
      diff,
    })),
  });
  if (!data || error) {
    throw new Error(JSON.stringify(error));
  }

  return list
    .map((e): RatingItem => {
      const levelBase =
        data.find(({ music_id, diff }) => music_id === e.musicId && diff === e.diff)?.[`const_${gamever}`] ?? 0;
      return {
        ...e,
        rating: calcRatingSingle(levelBase, e.score),
        levelBase,
      };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export interface PlaylogItem {
  playDate: number;
  musicId: number;
  diff: number;
  score: number;
  fc?: boolean;
  aj?: boolean;
}

export async function preparePlaylogList(list: PlaylogItem[]) {
  const best = new Map<number, PlaylogItem>();
  list.forEach((e) => {
    const id = e.musicId * 10 + e.diff;
    if (!best.has(id) || e.score > best.get(id)!.score) {
      best.set(id, e);
    }
  });
  const recent = list.sort((a, b) => b.playDate - a.playDate).slice(0, 30);
  return {
    best: [...best.values()],
    recent,
  };
}

export async function findMusicId(
  chuniData: Context['chuniData'],
  title: string,
  artist: string
): Promise<number | undefined> {
  const resp = await chuniData.from('music').select().eq('title', title).order('id');
  if (resp.error) throw new Error(JSON.stringify(resp.error));
  return (resp.data.find((e) => e.artist === artist) ?? resp.data[0]).id;
}

export function calcRatingAvg(b30: RatingItem[], r10: RatingItem[]) {
  const b30sum = b30.reduce((sum, { rating }) => sum + rating, 0);
  const b30avg = Math.floor((b30sum / 30) * 100) / 100;
  const r10sum = r10.reduce((sum, { rating }) => sum + rating, 0);
  const r10avg = Math.floor((r10sum / 10) * 100) / 100;
  const rating = Math.floor(((b30sum + r10sum) / 40) * 100) / 100;
  const ratingAchievable = Math.floor(((b30sum + b30[0].rating * 10) / 40) * 100) / 100;
  return { b30avg, r10avg, rating, ratingAchievable };
}

export function calcRatingSingle(levelBase: number, score: number) {
  let result = 0;
  if (score >= 1009000) result = levelBase + 2.15; //SSS+
  else if (score >= 1007500) result = levelBase + 2.0 + (score - 1007500) / 10000; //SSS
  else if (score >= 1005000) result = levelBase + 1.5 + (score - 1005000) / 5000; //SS+
  else if (score >= 1000000) result = levelBase + 1.0 + (score - 1000000) / 10000; //SS
  else if (score >= 975000) result = levelBase + (score - 975000) / 25000; //S+, S
  else if (score >= 925000) result = levelBase - 3.0 + ((score - 925000) * 3) / 50000; //AA
  else if (score >= 900000) result = levelBase - 5.0 + ((score - 900000) * 4) / 50000; //A
  else if (score >= 800000) result = (levelBase - 5.0) / 2 + ((score - 800000) * ((levelBase - 5) / 2)) / 100000; //BBB
  return Math.floor(result * 100) / 100; //C
}

export function getRank(score: number) {
  if (score >= 1009000) return 'SSS+';
  if (score >= 1007500) return 'SSS';
  if (score >= 1005000) return 'SS+';
  if (score >= 1000000) return 'SS';
  if (score >= 990000) return 'S+';
  if (score >= 975000) return 'S';
  if (score >= 950000) return 'AAA';
  if (score >= 925000) return 'AA';
  if (score >= 900000) return 'A';
  if (score >= 800000) return 'BBB';
  if (score >= 700000) return 'BB';
  if (score >= 600000) return 'B';
  if (score >= 500000) return 'C';
  return 'D';
}

export const levelNames = ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'ULTIMA', "WORLD'S END"];
export const levelNamesShort = ['BAS', 'ADV', 'EXP', 'MAS', 'ULT', 'WE'];
