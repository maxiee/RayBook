import { ipcMain } from "electron";
import { logService } from "../../services/log/LogServiceImpl";

export function registerIpcHandlers(service: any) {
  for (const method of Object.getOwnPropertyNames(
    Object.getPrototypeOf(service)
  )) {
    if (typeof service[method] === "function") {
      ipcMain.handle(
        `${service.constructor.name}:${method}`,
        async (event, ...args) => {
          try {
            return await service[method](...args);
          } catch (error) {
            logService.error(
              `Error in ${service.constructor.name}:${method}:`,
              error
            );
            throw error;
          }
        }
      );
    }
  }
}
