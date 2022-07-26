import React, {useState, useEffect} from 'react'
import styles from '../App/App.module.css'

function Counter() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            setCount(count + 1)
        }, 1000)
        return () => clearTimeout(timer)
    })

    return (
        <div className={styles.Counter}>
            Page has been open for {count} seconds.
        </div>
    );
}

export default Counter