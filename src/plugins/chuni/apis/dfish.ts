import { ofetch } from 'ofetch';

interface DFishAPIResultEntry {
  cid: number;
  ds: number;
  fc: string;
  level: string;
  level_index: number;
  level_label: string;
  mid: number;
  ra: number;
  score: number;
  title: string;
}

interface DFishAPIResultOK {
  nickname: string;
  rating: number;
  records: {
    b30: DFishAPIResultEntry[];
    r10: DFishAPIResultEntry[];
  };
  username: string;
}

interface DFishAPIResultError {
  message: string;
}

type DFishAPIResult = DFishAPIResultOK | DFishAPIResultError;

export async function chunithmQueryPlayer(params: { username: string } | { qq: string }) {
  return await ofetch<DFishAPIResult>('https://www.diving-fish.com/api/chunithmprober/query/player', {
    method: 'POST',
    body: params,
    ignoreResponseError: true,
  });
}
