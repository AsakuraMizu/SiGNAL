import http from 'http';
import Koa from 'koa';
import KoaBodyParser from 'koa-bodyparser';
import KoaRouter from 'koa-router';
import { MikroORM, MikroORMOptions } from 'mikro-orm';
import { App as KoishiApp, AppOptions as KoishiOptions } from 'koishi-core';
import { Logger } from 'koishi-utils';
import { apply as KoishiPluginMongo, Config as MongoConfig } from 'koishi-plugin-mongo';
import { createBot as createMineBot, Bot as MineBot, BotOptions as MineBotOptions } from 'mineflayer';
import { forgeHandshake } from 'minecraft-protocol-forge';
import 'koishi-adapter-cqhttp';

interface Options {
  koishi: KoishiOptions,
  mineflayer: { bot: MineBotOptions, mods: Array<String> },
  mongoKoishi: MongoConfig,
  mongoMikro: MikroORMOptions,
  plugins: Array<string | EnabledPlugin>,
  api_port: number,
  admin: Array<number>
}

interface EnabledPlugin {
  name: string,
  options: NodeJS.Dict<any>
}

class SiGNAL {
  options: Options;

  koishi: KoishiApp;

  mineflayer: MineBot;

  orm: MikroORM;

  logger = new Logger('main');

  server: http.Server;

  koa = new Koa();

  router = new KoaRouter();

  constructor(options: Options) {
    this.options = options;
  }

  async start() {
    this.koishi = new KoishiApp(this.options.koishi);
    this.koishi.plugin(KoishiPluginMongo, this.options.mongoKoishi);
    this.koishi.on('connect', async () => {
      this.options.admin.forEach((admin) => this.koishi.database.getUser(admin, 5));
    });
    this.koishi.prependMiddleware(async (session, next) => {
      if (session.messageType === 'group') {
        await this.koishi.database.getGroup(session.groupId, session.selfId);
      }
      return next();
    });
    this.mineflayer = createMineBot(this.options.mineflayer.bot);
    // eslint-disable-next-line no-underscore-dangle
    forgeHandshake(this.mineflayer._client, {
      forgeMods: this.options.mineflayer.mods.map((x) => {
        const [modid, version] = x.split('@');
        return { modid, version };
      }),
    });
    this.mineflayer.on('login', () => this.mineflayer.chat('Hi, I\'m SiGNAL.'));
    this.mineflayer.on('error', (err) => {
      this.logger.error(err);
    });
    this.orm = await MikroORM.init(this.options.mongoMikro).catch((err) => {
      this.logger.error('Failed to initialize MikroORM');
      this.logger.error(err.stack);
      return null;
    });
    this.options.plugins.forEach((plugin) => {
      try {
        if (typeof plugin === 'string') {
          const Plug: new () => { apply: (app: SiGNAL) => void } = require(plugin.replace(/^@sb\//, './plugins/'));
          const plug = new Plug();
          plug.apply(this);
        } else {
          const Plug: new (options: NodeJS.Dict<any>) => {
            apply: (app: SiGNAL) => void
          } = require(plugin.name.replace(/^@sb\//, './plugins/'));
          const plug = new Plug(plugin.options);
          plug.apply(this);
        }
      } catch (e) {
        this.logger.error(`Failed to load ${plugin.toString()}`);
        this.logger.error(e.stack);
      }
    });
    this.koa.use(KoaBodyParser());
    this.koa.use(this.router.routes()).use(this.router.allowedMethods());
    this.server = http.createServer(this.koa.callback);
    await this.koishi.start().catch((err) => {
      this.logger.error('Failed to start koishi');
      this.logger.error(err.stack);
      return null;
    });
    await this.koishi.getSelfIds();
    await new Promise((resolve) => {
      this.server.listen(this.options.api_port, () => {
        resolve();
      });
    });
  }

  async exit() {
    await this.orm.close();
    await this.koishi.stop();
    await new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });
    this.mineflayer.quit();
    this.mineflayer.end();
    process.exit(0);
  }
}

export default SiGNAL;
