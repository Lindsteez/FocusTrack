import { useState } from "react";
import Card from '../Card';
import RateEnergy from "./EnergyBtn";
import styles from './EnergyBtn.module.css';


function EnergyLog() {
    const [selected, setSelected] = useState(null)

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
        </Card>
    )
}

export default EnergyLog;
