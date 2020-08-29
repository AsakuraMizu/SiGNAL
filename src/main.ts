import { App as KoishiApp, AppOptions as KoishiOptions } from 'koishi-core';
import { apply as KoishiPluginMongo, Config as DbConfig } from 'koishi-plugin-mongo';
import { Logger } from 'koishi-utils';
import { createBot as createMineBot, Bot as MineBot, BotOptions as MineBotOptions } from 'mineflayer';
import { forgeHandshake } from 'minecraft-protocol-forge';
import 'koishi-adapter-cqhttp';

interface Options {
  koishi: KoishiOptions,
  mineflayer: {bot: MineBotOptions, mods: Array<String>},
  db: DbConfig,
  plugins: Record<string, NodeJS.Dict<any>>,
  admin: Array<number>
}

export default class SiGNAL {
  options: Options;

  koishi: KoishiApp;

  mineflayer: MineBot;

  logger = new Logger('SiGNAL');

  constructor(options: Options) {
    this.options = options;
  }

  async start() {
    // Initialize Koishi
    this.koishi = new KoishiApp(this.options.koishi);
    this.koishi.plugin(KoishiPluginMongo, this.options.db);
    this.koishi.on('connect', async () => {
      this.options.admin.forEach((admin) => this.koishi.database.getUser(admin, 5));
    });
    this.koishi.prependMiddleware(async (session, next) => {
      if (session.messageType === 'group') {
        await this.koishi.database.getGroup(session.groupId, session.selfId);
      }
      return next();
    });

    // Initialize Mineflayer
    this.mineflayer = createMineBot(this.options.mineflayer.bot);
    // eslint-disable-next-line no-underscore-dangle
    forgeHandshake(this.mineflayer._client, {
      forgeMods: this.options.mineflayer.mods.map((x) => {
        const [modid, version] = x.split('@');
        return { modid, version };
      }),
    });
    this.mineflayer.on('login', () => this.logger.info('connected to MC Server'));
    this.mineflayer.on('error', (err) => {
      this.logger.error(err);
    });

    // Load Plugins
    Object.entries(this.options.plugins).forEach(([name, options]) => {
      try {
        const Plug: new (options: NodeJS.Dict<any>) => { apply: (app: SiGNAL) => void } = require(`./plugins/${name}`).default;
        const plug = new Plug(options);
        plug.apply(this);
      } catch (e) {
        this.logger.error(`Failed to load ${name}`);
        this.logger.error(e);
      }
    });

    // Start everything
    await this.koishi.start();
    await this.koishi.getSelfIds();
  }

  async exit() {
    await this.koishi.stop();
    this.mineflayer.end();
    process.exit(0);
  }
}
