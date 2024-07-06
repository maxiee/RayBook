import log from "electron-log";
import path from "path";
import { ILogService } from "./LogServiceInterface";

class LogService implements ILogService {
  constructor() {
    const logPath = path.join(require("os").homedir(), ".raybook", "logs");
    log.transports.file.resolvePathFn = () =>
      path.join(logPath, `${new Date().toISOString().split("T")[0]}.log`);
    log.transports.file.level = "info";
    log.transports.console.level = "debug";
  }

  info(message: string, ...args: any[]): void {
    log.info(message, ...args);
  }
  warn(message: string, ...args: any[]): void {
    log.warn(message, ...args);
  }
  error(message: string, ...args: any[]): void {
    log.error(message, ...args);
  }
  debug(message: string, ...args: any[]): void {
    log.debug(message, ...args);
  }
}

export const logService = new LogService();
