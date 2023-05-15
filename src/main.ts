import { app } from './init';

app.start();

process.on('SIGINT', async () => {
  await app.stop();
  process.exit(0);
});
