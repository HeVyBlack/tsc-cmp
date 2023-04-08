const args = {};
const conf = {};
const entryPoints = [];
class Config {
  setArg(name, value) {
    args[name] = value;
  }
  getArg() {
    return args;
  }
  setConf(name, value) {
    conf[name] = value;
  }
  getConf() {
    return conf;
  }
  setEntryPoint(e) {
    entryPoints.push(e);
  }
  getEntryPoints() {
    return entryPoints;
  }
}

const config = new Config();

export default config;
