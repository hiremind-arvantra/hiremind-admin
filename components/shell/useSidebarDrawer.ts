"use client";

import { useCallback, useEffect, useState } from "react";

/*
 * Mobile sidebar drawer state, shared between a shell header (which owns the menu
 * button) and its sidebar (which renders the off-canvas panel). They are sibling
 * components in the layout, so the open state travels over a window event instead
 * of a context provider — the layouts stay server components.
 */
const EVENT = "hiremind:sidebar-drawer";

function broadcast(open: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: open }));
}

export function useSidebarDrawer(): [boolean, (open: boolean) => void] {
  const [open, setOpenState] = useState(false);

  useEffect(() => {
    const onChange = (e: Event) => setOpenState((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const setOpen = useCallback((next: boolean) => broadcast(next), []);
  return [open, setOpen];
}
