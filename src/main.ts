import { app } from './init';

app.start();

const cleanup = async () => {
  await app.stop();
  process.exit(0);
};

['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, cleanup));
