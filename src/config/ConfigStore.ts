import Store from 'electron-store';

interface Config {
  minioEndpoint?: string;
  minioAccessKey?: string;
  minioSecretKey?: string;
  mongoUri?: string;
}

class ConfigStore {
  private store: Store<Config>;

  constructor() {
    this.store = new Store<Config>();
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
      config.mongoUri
    );
  }
}

export const configStore = new ConfigStore();