import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production this would go to an error tracking service
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper} role="alert">
          <div className={styles.content}>
            <div className={styles.icon}>⚠</div>
            <h1>Something went wrong</h1>
            <p>
              We ran into an unexpected error. Our team has been notified.
              Try refreshing or returning to the home page.
            </p>
            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={this.handleReset}>
                Go Home
              </button>
              <button className={styles.btnSecondary} onClick={() => window.location.reload()}>
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
