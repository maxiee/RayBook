import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBook } from "../../models/Book";

export interface IBookService {
    findBookById(id: Id): Promise<ApiResponse<IBook>>;
}