import { Context } from 'koishi';
import * as bind from './commands/bind';
import * as rating from './commands/rating';
import * as rank from './commands/rank';
import * as rankChart from './commands/rank.chart';
import * as info from './commands/info';
import * as search from './commands/search';
import * as me from './commands/me';
import ChuniData from './data';
import type { OtogameTokens } from './apis/otogame';

export const name = 'chuni';
export const using = ['database'];

declare module 'koishi' {
  interface User {
    aimeUserIdList: Record<string, number>;
    otogameTokens: OtogameTokens;
  }
}

export function apply(ctx: Context) {
  ctx.plugin(ChuniData, {
    // This url and anon key is public; free to use in your project
    // or deploy one yourself using https://github.com/AsakuraMizu/chuni-data-scripts
    chuniDataUrl: 'https://czjtvowsyvdmnilbttoh.supabase.co',
    chuniDataKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6anR2b3dzeXZkbW5pbGJ0dG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODkzNDM1MDIsImV4cCI6MjAwNDkxOTUwMn0.Xs8RYEtg9SO4TprNzfG-4hxBsl77myXwf5TbCoDgYs8',
  });

  ctx.model.extend('user', {
    aimeUserIdList: 'json',
    otogameTokens: 'json',
  });

  ctx.plugin(bind);
  ctx.plugin(rating);
  ctx.plugin(rank);
  ctx.plugin(rankChart);
  ctx.plugin(info);
  ctx.plugin(search);
  ctx.plugin(me);
}
