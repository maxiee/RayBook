import { useState, useEffect, useCallback } from "react";
import { bookFileServiceRender, logServiceRender } from "../../../app";
import { deserializeId } from "../../../utils/DtoUtils";

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

  const setLocation = useCallback(
    async (newLocation: string) => {
      if (isLoading) {
        logServiceRender.debug(
          "Location update skipped: still loading initial data"
        );
        return;
      }

      logServiceRender.debug("Updating location:", newLocation);
      if (bookFileId) {
        const result = await bookFileServiceRender.updateBookFileLocation(
          deserializeId(bookFileId),
          newLocation
        );
        if (result.success) {
          logServiceRender.debug("Location updated:", result.payload.location);
          setLocationState(newLocation);
        } else {
          logServiceRender.error("Failed to update location:", result.message);
        }
      }
    },
    [bookFileId, isLoading]
  );

  return { location, setLocation, isLoading };
};
