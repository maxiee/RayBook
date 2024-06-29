import EPub from "epub2";
import { IMetadata } from "epub2/lib/epub/const";

class EpubMetadaService {
    async extractMetadata(filePath: string): Promise<IMetadata> {
        const epub: EPub = await EPub.createAsync(filePath);
        const metadata = epub.metadata;
        return metadata;
    }

}

export const epubMetadaService = new EpubMetadaService();