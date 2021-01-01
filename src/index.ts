import { Context } from 'koishi';

import * as sub from './sub';

export const name = 'SiGNAL';

export function apply(ctx: Context) {
  ctx.plugin(sub);
}
