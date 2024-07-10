import Store from 'electron-store';

type Config = {
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
    return this.store.get('config') as Config || {};
  }

  setConfig(config: Partial<Config>): void {
    const currentConfig = this.getConfig();
    this.store.set('config', { ...currentConfig, ...config });
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