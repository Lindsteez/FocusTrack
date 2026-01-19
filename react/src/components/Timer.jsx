
import { useEffect, useState } from "react";
import styles from './Timer.module.css'

function pad2(n) {
    return String(n).padStart(2,"0");
}

export default function Timer({ isRunning }) {
    const [seconds, setSeconds] = useState(0)

    useEffect (() => {
        if (!isRunning) return;
        
        const id = setInterval(() => {
            setSeconds ((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(id);
    },[isRunning]);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return (
        <div className={styles.timer}>
            {pad2(hours)}.{pad2(minutes)}.{pad2(secs)}
        </div>
    )
}