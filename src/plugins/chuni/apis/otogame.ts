import { ofetch, type $Fetch } from 'ofetch';
import { PromisePool } from '@supercharge/promise-pool';

export interface OtogameApiResult<T> {
  code: number | string;
  message: string;
  data: T;
  timestamp: number;
}

export interface OtogameChunithmPlaylogEntry {
  music: {
    // music_id: string;
    name: string;
    artist: string;
    // jacket: string;
  };
  play_date: number;
  difficulty: number;
  // track: number;
  score: number;
  // rank: number;
  // max_combo: number;
  // max_chain: number;
  // rate_tap: number;
  // rate_hold: number;
  // rate_slide: number;
  // rate_air: number;
  // rate_flick: number;
  // is_new_record: boolean;
  is_full_combo: boolean;
  // full_chain_kind: number;
  is_all_justice: boolean;
  // skill_id: number;
  // play_kind: number;
  // is_clear: boolean;
  // skill_level: number;
  // skill_effect: number;
}

export interface OtogameTokens {
  refreshToken: string;
  accessToken: string;
  idToken: string;
}

export class OtogameAPIClient {
  constructor(public tokens: OtogameTokens) {}

  async tokenRefresh() {
    const { token } = (
      await ofetch<
        OtogameApiResult<{
          auth_type: 'refresh';
          token: { access_token: string; refresh_token: string; id_token: string };
        }>
      >('https://v2.otogame.net/api/aime/token/refresh', {
        method: 'POST',
        body: {
          refresh_token: this.tokens.refreshToken,
        },
      })
    ).data;
    this.tokens = {
      refreshToken: token.refresh_token,
      accessToken: token.access_token,
      idToken: token.id_token,
    };
  }

  private get headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.tokens.idToken}`,
    };
  }

  private async makeRequest<T>(f: () => Promise<T>): Promise<T> {
    try {
      return await f();
    } catch (e) {
      await this.tokenRefresh();
      return await f();
    }
  }

  private async chunithmPlaylog(page: number) {
    return (
      await ofetch<
        OtogameApiResult<{
          data: OtogameChunithmPlaylogEntry[];
          pagination: { total: number; page: number; per_page: number; total_page: number };
        }>
      >('https://v2.otogame.net/api/game/chunithm/playlog', {
        params: {
          page,
        },
        headers: this.headers,
      })
    ).data;
  }

  async chunithmPlaylogAll() {
    return await this.makeRequest(async () => {
      const firstPagePlaylog = await this.chunithmPlaylog(1);
      const { results, errors } = await PromisePool.withConcurrency(10)
        .for(Array.from({ length: firstPagePlaylog.pagination.total_page - 1 }).map((_, i) => i + 2))
        .process((page) => this.chunithmPlaylog(page));
      if (errors.length !== 0) console.log(JSON.stringify(errors));
      return [...firstPagePlaylog.data, ...results.flatMap((playlog) => playlog.data)];
    });
  }

  async chunithmProfile() {
    return await this.makeRequest(async () => {
      return (
        await ofetch<
          OtogameApiResult<{
            user_name: string;
            level: number;
            play_count: number;
            player_rating: number;
            highest_rating: number;
          }>
        >('https://v2.otogame.net/api/game/chunithm/profile', {
          headers: this.headers,
        })
      ).data;
    });
  }
}
