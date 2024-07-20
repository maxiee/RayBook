import { useState, useEffect, useCallback } from "react";
import { bookFileServiceRender, logServiceRender } from "../../../../app";
import { deserializeId } from "../../../../utils/DtoUtils";

export const useBookLocation = (bookFileId: string) => {
  const [location, setLocationState] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoading(true);
      if (bookFileId) {
        const result = await bookFileServiceRender.findBookFileByBookFileId(
          deserializeId(bookFileId)
        );
        if (result.success && result.payload.location) {
          logServiceRender.debug("Location found:", result.payload.location);
          setLocationState(result.payload.location);
        }
      }
      setIsLoading(false);
    };
    fetchLocation();
  }, [bookFileId]);

  const setLocation = useCallback((newLocation: string) => {
    setLocationState(newLocation);
  }, []);

  const saveLocation = useCallback(async () => {
    if (bookFileId && location) {
      const result = await bookFileServiceRender.updateBookFileLocation(
        deserializeId(bookFileId),
        location
      );
      if (result.success) {
        logServiceRender.debug("Location saved:", result.payload.location);
      } else {
        logServiceRender.error("Failed to save location:", result.message);
      }
    }
  }, [bookFileId, location]);

  return { location, setLocation, saveLocation, isLoading };
};
