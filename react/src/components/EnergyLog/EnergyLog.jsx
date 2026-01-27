import { useState, useEffect } from "react";
import Card from '../Card';
import RateEnergy from "./EnergyBtn";
import styles from './EnergyBtn.module.css';


function EnergyLog() {
    const [selected, setSelected] = useState(null);

    // Modal
    const [isOpen, setIsOpen] = useState(false);
    const [note, setNote] = useState('');

    // History
    const [history, setHistory] = setState([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if(raw) setHistory(JSON.parse(raw));
        } catch {
            //ignore parse errors
        }
    }, []);

    function openModal (level) {
        setSelected(level);
        setNote('');
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    function handleSave() {
        const entry = {
            id: crypto?.randomUUID?.() ?? String(Date.now()),
            level: selected,
            note: note.trim(),
            createdAt: new Date().toISOString(),
        };

        const next = [entry, ...history];
        setHistory(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));

        closeModal();
    }

    function handleCancel() {
        const ok = window.confirm('Are you sure? Your text will not be saved.')
        if (ok) closeModal();
    }

    return(
        <Card title = 'Energy Level'> 

            <h2>How's your Energy?</h2>

            <div className = {styles.buttons}>
                {[1,2,3,4,5].map(n => (
                    <RateEnergy 
                    key = {n}
                    rateEnergy= {n}
                    isActive= {selected === n}
                    onClick={() => setSelected(n)} 
                    />
                ))}
            </div>

            { isOpen && (
                <div className={styles.backdrop} onClick={handleCancel}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Energy: {selected}</h3>

                        <label className= {styles.label}>
                            Note
                            <input 
                            className= {styles.input
                            value= 
                            }
                            >
                            </input>
                        </label>

                    </div>

                </div>
            )}
        </Card>
    )
}

export default EnergyLog;
