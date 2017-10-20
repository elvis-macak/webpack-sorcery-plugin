import sorcery from 'sorcery';

const DEFAULT_INCLUDE = /\.js$|\.map$/;

export default class SorceryPlugin {
  constructor(options) {
    this.include = options.include || DEFAULT_INCLUDE
    this.exclude = options.exclude
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, cb) => {
      const files = this.getFiles(compilation);
      this.sorceryFiles(files)
        .then(() => cb());
    });
  }

  getFiles(compilation) {
    return Object.keys(compilation.assets)
      .map((name) => {
        if (this.isIncludeOrExclude(name)) {
          return {
            name,
            path: compilation.assets[name].existsAt
          }
        }
        return null
      })
      .filter(i => i);
  }

  isIncludeOrExclude(filename) {
    const isIncluded = this.include ? this.include.test(filename) : true
    const isExcluded = this.exclude ? this.exclude.test(filename) : false
    return isIncluded && !isExcluded
  }

  sorceryFiles(files) {
    return Promise.all(files.map(({
      path,
      name
    }) => sorcery.load(path).then((chain) => chain.write())))
  }

}