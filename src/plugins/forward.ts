import { ChatMessage } from 'mineflayer';
import SiGNAL from '../main';
import PluginBase from './base';

export default class Forward extends PluginBase<{group: number}> {
  apply(app: SiGNAL) {
    app.koishi.on('message', (session) => {
      if (session.messageType === 'group' && session.groupId === this.options.group) {
        const msg = `[QQ] ${session.sender.nickname}: ${session.message}`
          .replace(/&#91;/gm, '[')
          .replace(/&#93;/gm, ']')
          .replace(/&amp;/gm, '&');
        app.mineflayer.chat(msg);
      }
    });
    const send = (message: string) => app.koishi.getSelfIds().then((res) => {
      const selfId = res[0];
      app.koishi.bots[selfId].sendGroupMsg(this.options.group, message);
    });
    app.mineflayer.on('chat', (username, message) => {
      if (username !== app.mineflayer.username) {
        send(`[MC] ${username}: ${message}`);
      }
    });
    app.mineflayer.on('playerJoined', (player) => {
      if (player.username !== app.mineflayer.username) {
        send(`[MC] ${player.username} 加入了游戏`);
      }
    });
    app.mineflayer.on('playerLeft', (player) => {
      if (player.username !== app.mineflayer.username) {
        send(`[MC] ${player.username} 退出了游戏`);
      }
    });
    // @ts-ignore
    app.mineflayer.on('message', (msg: ChatMessage) => {
      if (msg.translate && msg.translate.startsWith('death')) {
        // @ts-ignore
        send(`[MC] ${msg.json.with[0].insertion} 死了`);
      }
    });
  }
}
