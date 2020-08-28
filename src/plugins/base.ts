export default class PluginBase<T extends {}> {
  options: T;

  constructor(options: T) {
    this.options = options;
  }
}
