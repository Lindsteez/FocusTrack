import { useEffect, useState } from "react";

export function useMediaQuery(query) {
    const get = () => window.matchMedia(query).matches;
    const [matches, setMatches] = useState (() => get ());

    useEffect(() => {
        const m = window.matchMedia(query);
        const onChange = () => setMatches(m.matches);
        onChange();
        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, [query]);

    return matches;
}