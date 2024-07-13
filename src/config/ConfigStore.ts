import Store from "electron-store";
import path from "path";
import os from "os";

interface Config {
  minioEndpoint?: string;
  minioAccessKey?: string;
  minioSecretKey?: string;
  mongoUri?: string;
  defaultStoragePath?: string;
}

class ConfigStore {
  private store: Store<Config>;

  constructor() {
    this.store = new Store<Config>();
    // 设置默认存储路径
    if (!this.store.has("defaultStoragePath")) {
      this.store.set("defaultStoragePath", path.join(os.homedir(), ".raybook"));
    }
  }

  getConfig(): Config {
    return this.store.store;
  }

  setConfig(config: Partial<Config>): void {
    this.store.set(config);
  }

  hasRequiredConfig(): boolean {
    const config = this.getConfig();
    return !!(
      config.minioEndpoint &&
      config.minioAccessKey &&
      config.minioSecretKey &&
      config.mongoUri &&
      config.defaultStoragePath
    );
  }

  getDefaultStoragePath(): string {
    return this.store.get("defaultStoragePath") as string;
  }
}

export const configStore = new ConfigStore();
