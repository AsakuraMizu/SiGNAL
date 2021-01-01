require('koishi-adapter-cqhttp');

/** @type {import('koishi/dist/worker').AppConfig} */
const options = {
  plugins: [
    ['mongo', {
      host: 'localhost',
      port: 27017,
      username: 'root',
      password: 'root',
      name: 'koishi',
    }],
    ['common'],
    ['status'],
    ['./dist'],
  ],
  type: 'cqhttp:ws',
  server: 'ws://localhost:6700/?access_token=TOKEN',
  preferSync: true,
  port: 8787,
  prefix: '/',
  defaultAuthority: 1,
};

module.exports = options;
