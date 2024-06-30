const { ipcRenderer } = window.require('electron');

// renderer/ipc/ipcClient.ts
export function createIpcProxy<T extends object>(serviceName: string): T {
  return new Proxy({} as T, {
    get: (target, prop) => {
      return (...args: any[]) => ipcRenderer.invoke(`${serviceName}:${prop.toString()}`, ...args);
    }
  });
}