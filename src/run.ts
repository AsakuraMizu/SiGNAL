import path from 'path';
import repl from 'repl';
import SiGNAL from './main';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var app: SiGNAL;
}

const config = require(path.resolve(process.cwd(), 'config.json'));
const App = new SiGNAL(config);
global.app = App;

const r = repl.start('> ');
r.context.App = App;
r.on('exit', () => App.exit());

App.start();
