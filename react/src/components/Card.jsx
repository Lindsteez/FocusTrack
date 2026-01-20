
import { Children } from 'react'
import styles from './Card.module.css'

function Card({title, children}) {

    return (
        <div className={styles.card}>
            <div className={styles.header}>{title}</div>

            <div className={styles.content}>
                {children}
            </div>
        </div>
    )

}


export default Card;