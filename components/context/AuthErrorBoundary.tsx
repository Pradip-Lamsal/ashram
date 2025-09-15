"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Authentication Error
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                There was an issue with the authentication system.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-gray-500">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
