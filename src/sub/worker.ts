import { Context, Session } from 'koishi';
import { channels } from '.';
import { Sub } from './database';

export default class Worker {
  id: string;
  sessions: Session[];
  handle: NodeJS.Timeout;

  constructor(sub: Sub, ctx: Context) {
    this.id = sub.id;
    this.sessions = sub.groups.map(groupId => new Session(ctx.app, { groupId, selfId: ctx.bots[0].selfId }));

    this.update();
  }

  clear() {
    clearInterval(this.handle);
  }

  async update() {
    const [type, id] = this.id.split(':');
    const channel = channels.get(type);
    const result = await channel.update(id);
    if (result !== null) {
      await Promise.all(this.sessions.map(s => s.$send(result)));
    }

    this.handle = setTimeout(() => this.update(), 60000);
  }
}
