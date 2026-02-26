import { useEffect, useState } from "react";

export default function ToDoDesktopOnly({ children, breakpoint = 768 }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect (() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);

  }, [breakpoint]);

  if (!isDesktop) return null;
  return children;
}