import { useState } from "react"
import RateEnergy from "./EnergyBtn";
import styles from './EnergyBtn.module.css'

function EnergyLog() {
    const [selected, setSelected] = useState(null)
    return(
        <div className={`${styles.EnergyDiv}`}>
            <h1>Energy Level</h1>
            <h2>How's your Energy?</h2>
            <div>
                {[1,2,3,4,5].map(n => (
                    <RateEnergy 
                    key = {n}
                    rateEnergy= {n}
                    isActive= {selected === n}
                    onClick={() => setSelected(n)} 
                    />
                ))}
            </div>
        </div>
    )
}

export default EnergyLog;
