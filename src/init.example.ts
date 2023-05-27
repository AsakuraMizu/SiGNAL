import { App } from 'koishi';

// console
import console from '@koishijs/plugin-console';
import login from '@koishijs/plugin-login';
import * as analytics from '@koishijs/plugin-analytics';
import dataview from '@koishijs/plugin-dataview';
import logger from '@koishijs/plugin-logger';
import * as sandbox from '@koishijs/plugin-sandbox';
import explorer from '@koishijs/plugin-explorer';
import chat from 'koishi-plugin-chat';

// commands
import * as help from '@koishijs/plugin-help';
import * as status from '@koishijs/plugin-status';

// database
import sqlite from '@koishijs/plugin-database-sqlite';

// adapter
import onebot from '@koishijs/plugin-adapter-onebot';

// plugins
import * as aqua from '@sibot/aqua';
import * as verifier from 'koishi-plugin-verifier';

export const app = new App({
  host: '0.0.0.0',
  port: 5140,
  maxPort: 5149,
});

app.plugin(console);
app.plugin(login);
app.plugin(analytics);
app.plugin(dataview);
app.plugin(logger);
app.plugin(sandbox);
app.plugin(explorer);
app.plugin(chat);
app.plugin(verifier, {
  onFriendRequest: true,
  onGuildMemberRequest: true,
  onGuildRequest: true,
});

app.plugin(help);
app.plugin(status);

app.plugin(sqlite);

app.plugin(aqua, {
  aimedb: '127.0.0.1',
  aqua: '127.0.0.1',
});

app.plugin(onebot, {
  protocol: 'ws',
  selfId: '123456789',
  endpoint: 'ws://127.0.0.1:8000',
});
