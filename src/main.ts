import closeWithGrace from 'close-with-grace';
import { app } from './init';

app.start();

closeWithGrace(async () => {
  await app.stop();
});
