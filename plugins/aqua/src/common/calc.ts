export interface RequiredB30Item {
  musicId: string;
  level: string;
  // playCount: string;
  scoreMax: string;
  // resRequestCount: string;
  // resAcceptCount: string;
  // resSuccessCount: string;
  // missCount: string;
  // maxComboCount: string;
  isFullCombo: string;
  isAllJustice: string;
  // isSuccess: string;
  // fullChain: string;
  // maxChain: string;
  // scoreRank: string;
  // isLock: string;
  // theoryCount: string;
  rating: number;
}

export interface RequiredR10Item {
  musicId: string;
  difficultId: string;
  // romVersionCode: string;
  score: string;
  rating: number;
}

export function calc(b30: RequiredB30Item[], r10: RequiredR10Item[]) {
  const b30sum = b30.reduce((sum, { rating }) => sum + rating, 0);
  const b30avg = (Math.floor(b30sum / 30) / 100).toFixed(2);
  const r10sum = r10.reduce((sum, { rating }) => sum + rating, 0);
  const r10avg = (Math.floor(r10sum / 10) / 100).toFixed(2);
  const rating = (Math.floor((b30sum + r10sum) / 40) / 100).toFixed(2);
  return { b30avg, r10avg, rating };
}
