import { CoverIamgeRepostory } from "../repository/CoverImageRepostory";

describe('CoverIamgeRepostory', () => {
  describe('constructCoverImageFilename', () => {
    it('should correctly construct filename with image/jpeg mime type', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book123', 'image/jpeg');
      expect(result).toBe('book-cover-images/book123.jpeg');
    });

    it('should correctly construct filename with image/png mime type', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book456', 'image/png');
      expect(result).toBe('book-cover-images/book456.png');
    });

    it('should handle mime types without subtype', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book789', 'image');
      expect(result).toBe('book-cover-images/book789.undefined');
    });

    it('should handle non-standard mime types', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book101', 'application/octet-stream');
      expect(result).toBe('book-cover-images/book101.octet-stream');
    });
  });
});