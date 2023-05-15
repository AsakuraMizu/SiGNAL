import { Context } from 'koishi';

// console
import console from '@koishijs/plugin-console';
import * as analytics from '@koishijs/plugin-analytics';
import dataview from '@koishijs/plugin-dataview';
import logger from '@koishijs/plugin-logger';
import * as sandbox from '@koishijs/plugin-sandbox';

// commands
import * as help from '@koishijs/plugin-help';
import * as status from '@koishijs/plugin-status';

// database
import sqlite from '@koishijs/plugin-database-sqlite';

// adapter
import onebot from '@koishijs/plugin-adapter-onebot';

// plugins
import * as aqua from '@sibot/aqua';

export const ctx = new Context({
  port: 5140,
  maxPort: 5149,
});

ctx.plugin(console);
ctx.plugin(analytics);
ctx.plugin(dataview);
ctx.plugin(logger);
ctx.plugin(sandbox);

ctx.plugin(help);
ctx.plugin(status);

ctx.plugin(sqlite);

ctx.plugin(aqua, {
  aimedb: '127.0.0.1',
  aqua: '127.0.0.1',
});

ctx.plugin(onebot, {
  protocol: 'ws',
  selfId: '123456789',
  endpoint: 'ws://127.0.0.1:8000',
});
