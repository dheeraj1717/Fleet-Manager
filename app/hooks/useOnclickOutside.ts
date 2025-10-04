import { RefObject, useEffect } from "react";

export const useOnclickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current;
      if (!el || el.contains(event.target as HTMLElement)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};
