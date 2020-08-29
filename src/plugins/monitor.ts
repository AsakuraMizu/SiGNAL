import { apply as KoishiPluginMoniter } from 'koishi-plugin-monitor';
import SiGNAL from '../main';
import PluginBase from './base';

export default class Moniter extends PluginBase<{}> {
  apply(app: SiGNAL) {
    app.koishi.plugin(KoishiPluginMoniter);
  }
}
