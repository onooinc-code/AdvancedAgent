import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f] p-8 text-gray-300">
          <div className="max-w-2xl rounded-lg border border-red-500/50 bg-red-900/20 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400">Something went wrong.</h1>
            <p className="mt-4">An unexpected rendering error occurred, and the application cannot continue. Please try refreshing the page. If the problem persists, please report the details below.</p>
            <div className="mt-6 text-left">
              <details>
                <summary className="cursor-pointer font-semibold text-gray-400">Error Details</summary>
                <pre className="mt-2 h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-black/30 p-4 text-left font-mono text-xs text-red-300">
                  {this.state.error?.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
