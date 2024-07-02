import { ApiResponse } from "../../core/ipc/ApiResponse";

export interface IFileService {
  selectDirectory(): Promise<ApiResponse<string>>;
}
