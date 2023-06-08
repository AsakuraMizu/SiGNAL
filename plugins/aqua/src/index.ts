import { Context, Schema } from 'koishi';
import API from './api';
import * as bind from './commands/bind';
import * as rating from './commands/rating';
import * as crating from './commands/crating';
import * as rank from './commands/rank';

export const name = 'aqua';
export const using = ['database'];

export const Config: Schema<API.Config> = Schema.object({
  aimedb: Schema.string().required(),
  aqua: Schema.string().required(),
});

declare module 'koishi' {
  interface User {
    userId: number;
  }
}

export function apply(ctx: Context, config: API.Config) {
  ctx.plugin(API, config);

  ctx.model.extend('user', {
    userId: 'integer',
  });

  ctx.plugin(bind);
  ctx.plugin(rating);
  ctx.plugin(crating);
  ctx.plugin(rank);
}
