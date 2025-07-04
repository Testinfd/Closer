'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <h2>Something went wrong</h2>
          <p className="error-message">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            className="imp-button" 
            onClick={this.resetError}
          >
            Try Again
          </button>
          <style jsx>{`
            .error-boundary-container {
              padding: 20px;
              margin: 20px 0;
              border: 1px solid #e74c3c;
              border-radius: 8px;
              background-color: #fef5f5;
              text-align: center;
              color: #333;
            }
            .error-message {
              font-family: monospace;
              padding: 10px;
              background-color: #f9f2f2;
              border-radius: 4px;
              margin: 15px 0;
              white-space: pre-wrap;
              word-break: break-word;
            }
            
            :global(.dark) .error-boundary-container {
              background-color: #3a2c2c;
              border-color: #a83232;
              color: #f0f0f0;
            }
            
            :global(.dark) .error-message {
              background-color: #2a2020;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 