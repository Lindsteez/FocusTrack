
// import { useEffect, useMemo, useRef } from "react";
// import styles from "./Timer.module.css";

// function pad2(n) {
//   return String(n).padStart(2, "0");
// }

// export default function Timer({ seconds }) {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;

//   const CYCLE_SECONDS = 60 * 60; // 3600
//   const cycleSeconds = seconds % CYCLE_SECONDS; // 0..3599
//   const progress = cycleSeconds / CYCLE_SECONDS;

//   const size = 250;
//   const stroke = 15;
//   const r = (size - stroke) / 2;
//   const c = 2 * Math.PI * r;

//   const prevCycle = useRef(cycleSeconds);
//   const progressRef = useRef(null);

//   const dashOffset = useMemo(() => c * (1 - progress), [c, progress]);

//   useEffect(() => {
//     const wrapped = cycleSeconds < prevCycle.current;
//     prevCycle.current = cycleSeconds;

//     if (!wrapped) return;

//     const el = progressRef.current;
//     if (!el) return;

//     // 1) stäng av transition genom att ta bort animate-klassen
//     el.classList.remove(styles.animate);

//     // 2) tvinga en reflow så att borttagningen “tar”
    
//     const _ = el.getBoundingClientRect();

//     // 3) slå på transition igen nästa frame
//     requestAnimationFrame(() => {
//       el.classList.add(styles.animate);
//     });
//   }, [cycleSeconds]);

//   return (
//     <div className={styles.wrap} style={{ width: size, height: size }}>
//       <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//         <circle
//           className={styles.track}
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           strokeWidth={stroke}
//         />

//         <circle
//           ref={progressRef}
//           className={`${styles.progress} ${styles.animate}`}
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           strokeWidth={stroke}
//           strokeDasharray={c}
//           strokeDashoffset={dashOffset}
//         />
//       </svg>

//       <div className={styles.time}>
//         {pad2(hours)}.{pad2(minutes)}.{pad2(secs)}
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useRef } from "react";
import styles from "./Timer.module.css";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

type TimerProps = {
  seconds: number;
};

export default function Timer({ seconds }: TimerProps) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const CYCLE_SECONDS = 60 * 60; // 3600
  const cycleSeconds = seconds % CYCLE_SECONDS; // 0..3599
  const progress = cycleSeconds / CYCLE_SECONDS;

  const size = 250;
  const stroke = 15;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const prevCycle = useRef<number>(cycleSeconds);
  const progressRef = useRef<SVGCircleElement | null>(null);

  const dashOffset = useMemo(() => c * (1 - progress), [c, progress]);

  useEffect(() => {
    const wrapped = cycleSeconds < prevCycle.current;
    prevCycle.current = cycleSeconds;

    if (!wrapped) return;

    const el = progressRef.current;
    if (!el) return;

    el.classList.remove(styles.animate);

    // tvinga reflow
    el.getBoundingClientRect();

    requestAnimationFrame(() => {
      el.classList.add(styles.animate);
    });
  }, [cycleSeconds]);

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />

        <circle
          ref={progressRef}
          className={`${styles.progress} ${styles.animate}`}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className={styles.time}>
        {pad2(hours)}.{pad2(minutes)}.{pad2(secs)}
      </div>
    </div>
  );
}
