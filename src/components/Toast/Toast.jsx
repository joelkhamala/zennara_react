import { useState, useEffect } from 'react'
import styles from './Toast.module.css'

export default function Toast() {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Show initial toast
    setTimeout(() => {
      setMessage('Welcome to ZENNARA')
      setShow(true)
    }, 1000)

    // Hide after 4 seconds
    setTimeout(() => {
      setShow(false)
    }, 5000)
  }, [])

  const handleClick = () => {
    setShow(false)
  }

  if (!message) return null

  return (
    <div 
      className={`${styles.toast} ${show ? styles.show : ''}`}
      onClick={handleClick}
    >
      {message}
    </div>
  )
}
