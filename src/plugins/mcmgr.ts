import Rcon from 'modern-rcon';
import SiGNAL from '../main';
import PluginBase from './base';

interface McMgrOptions {
  rcon: RconOptions
}

interface RconOptions {
  host: string,
  port?: number,
  password: string,
  timeout?: number
}

export default class McMgr extends PluginBase<McMgrOptions> {
  apply(app: SiGNAL) {
    app.koishi.command('mc', { description: 'CytoLive! Minecraft 服务器相关' });
    app.koishi.command('mc.stat', { description: '查询 CytoLive! Minecraft 服务器状态' })
      .action(() => [
        '[SiGNAL] CytoLive! MC 服务器状态',
        `在线人数: ${Object.keys(app.mineflayer.players).length}`,
        `延迟: ${app.mineflayer.player.ping}`,
      ].join('\n'));
    app.koishi.command('mc.exec <cmd...>', { description: '执行后台指令', authority: 2 })
      .action(async (_, cmd) => {
        const {
          host, port, password, timeout,
        } = this.options.rcon;
        const rcon = new Rcon(host, port, password, timeout);
        await rcon.connect();
        const res = await rcon.send(cmd);
        return res;
      });
  }
}
