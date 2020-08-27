import SiGNAL from '../main';

export = class {
  group: number;

  constructor(options: { group: number }) {
    this.group = options.group;
  }

  apply = (app: SiGNAL) => {
    app.koishi.on('message', (session) => {
      if (session.messageType === 'group' && session.groupId === this.group)
        app.mineflayer.chat(`[QQ] ${session.sender.nickname}: ${session.message}`);
    });
    app.mineflayer.on('chat', (username, message) => {
      if (username !== app.mineflayer.username) {
        app.koishi.getSelfIds().then(async (res) => {
          const selfId = res[0];
          await app.koishi.bots[selfId].sendGroupMsg(this.group, `[MC] ${username}: ${message}`);
        });
      }
    });
  };
}
