import { CoverIamgeRepostory } from "../repository/CoverImageRepostory";

describe('CoverIamgeRepostory', () => {
  describe('constructCoverImageFilename', () => {
    it('should correctly construct filename with .jpg extension', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book123', 'cover.jpg');
      expect(result).toBe('book123.jpg');
    });

    it('should correctly construct filename with .png extension', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book456', 'image.png');
      expect(result).toBe('book456.png');
    });

    it('should handle filenames without extension', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book789', 'noextension');
      expect(result).toBe('book789');
    });

    it('should handle filenames with multiple dots', () => {
      const result = CoverIamgeRepostory.constructCoverImageFilename('book101', 'cover.image.jpg');
      expect(result).toBe('book101.jpg');
    });
  });
});