import SiGNAL from '../main';
import PluginBase from './base';

interface CommonOptions {

}

export default class Common extends PluginBase<CommonOptions> {
  apply(app: SiGNAL) {
    app.koishi.command('stat')
      .action(async ({ session }) => {
        const { nickname, userId } = await session.$bot.getLoginInfo();
        const versionInfo = await session.$bot.getVersionInfo();
        const {
          coolqEdition,
          pluginVersion,
          pluginBuildNumber,
          pluginBuildConfiguration,
          goCqhttp,
          runtimeVersion,
          runtimeOs,
        } = versionInfo;
        return [
          '[SiGNAL] 运行状态',
          `登录账号: ${nickname}(${userId})`,
          `酷Q版本: ${coolqEdition}${goCqhttp ? `(go-cqhttp:${runtimeOs}-${runtimeVersion})` : ''}`,
          `HTTP API: ${pluginVersion}-${pluginBuildNumber}-${pluginBuildConfiguration}`,
        ].join('\n');
      });
  }
}
