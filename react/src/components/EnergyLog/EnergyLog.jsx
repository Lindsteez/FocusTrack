import { useState } from "react";
import Card from '../Card';
import RateEnergy from "./EnergyBtn";
import styles from './EnergyBtn.module.css';
import { addSession } from '../../utils/sessionsStore';

export default function EnergyLog() {
    const [selected, setSelected] = useState(null);

    // Modal
    const [isOpen, setIsOpen] = useState(false);
    const [note, setNote] = useState('');

    function handleSave() {
        addSession({
            seconds: '',
            category: "Energy",
            description: `Energy level: ${selected}`,
            note: note.trim().slice(0, 100) || '',
            createdAt: new Date().toISOString(),
        });

        setIsOpen(false);
    }

    function handleCancel() {
        const ok = window.confirm('Are you sure? Your text will not be saved.')
        if (ok) setIsOpen(false);
    }

    return(
        <Card title='Energy Level'> 

            <h2>How's your Energy?</h2>

            <div className = {styles.buttons}>
                {[1,2,3,4,5].map(n => (
                    <RateEnergy 
                    key = {n}
                    rateEnergy= {n}
                    isActive= {selected === n}
                    onClick={() => {
                        setSelected(n);
                        setNote('');
                        setIsOpen(true);
                        } 
                    }
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
                            className={styles.input}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={100}
                            placeholder='Write a note'
                            autoFocus
                            />
                        </label>

                        <div className={styles.counter}>
                            {note.length/100*100}
                        </div>

                        <div className={styles.modalActions}>
                            <button 
                                className={styles.saveBtn} 
                                onClick={handleSave} 
                                disabled={selected == null}>
                                Save
                            </button>
                            <button 
                                className={styles.cancelBtn} 
                                onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

