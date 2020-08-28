import SiGNAL from '../main';
import PluginBase from './base';

export default class McMgr extends PluginBase<{}> {
  apply(app: SiGNAL) {
    app.koishi.command('mc.stat', { description: '查询 CytoLive! Minecraft 服务器状态' })
      .action(() => [
        '[SiGNAL] CytoLive! MC 服务器状态',
        `在线人数: ${Object.keys(app.mineflayer.players).length}`,
        `延迟: ${app.mineflayer.player.ping}`,
      ].join('\n'));
  }
}
