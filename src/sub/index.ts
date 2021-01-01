import { Context, Session } from 'koishi';
import { Channel } from './channels/base';
import { BiliLive } from './channels/bililive';
import Worker from './worker';
import './database';

export let channels: Map<string, Channel>;

export const name = 'sub';

export function apply(ctx: Context) {
  channels = new Map<string, Channel>([
    ['bililive', new BiliLive()],
  ]);
  channels.forEach((c, k) => c.apply(ctx.group(), async (session: Session, id: string) => {
    await ctx.database.createSub(`${k}:${id}`, session.groupId);
    await session.$send(`订阅 ${c.format(id)} 成功!`);
    await reloadWorker();
  }));

  let workers: Worker[] = [];

  async function reloadWorker() {
    workers.forEach(w => w.clear());
    workers = (await ctx.database.getAllSub()).map(s => new Worker(s, ctx));
  }

  ctx.on('connect', reloadWorker);

  ctx.group().command('sub', '订阅');
  ctx.group().command('sub.list', '订阅列表')
    .action(async ({ session }) => {
      const subs = await ctx.database.getSubs(session.groupId);
      await session.$send(`本群的订阅列表:\n${subs.map(s => {
        const [type, id] = s.split(':');
        return `${channels.get(type).format(id)} (${s})`;
      }).join('\n')}`)
    });
  ctx.group().command('sub.cancel <id>', '取消订阅')
    .action(async ({ session }, id: string) => {
      await ctx.database.removeSub(id, session.groupId);
      const [type, id_] = id.split(':');
      await session.$send(`取消订阅 ${channels.get(type).format(id)} 成功!`);
    });
}
