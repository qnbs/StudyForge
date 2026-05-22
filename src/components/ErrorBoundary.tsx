import { Component, ErrorInfo, ReactNode } from 'react';
import { db } from '../lib/db';
import { AlertTriangle, RefreshCcw, HardDrive } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = async () => {
    if (confirm('This will completely reset your database and clear all local data. Are you sure?')) {
      try {
        await db.delete();
        window.location.reload();
      } catch (err) {
        console.error("Failed to delete database:", err);
        alert("Failed to reset database. Please clear site data manually.");
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-50 text-slate-900 rounded-xl border border-slate-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-6">An unexpected error occurred in the component tree.</p>
          
          <div className="bg-red-50 border border-red-100 text-red-900 p-4 rounded-lg w-full max-w-2xl text-left mb-6 overflow-auto max-h-48 text-xs font-mono shadow-sm">
            <p className="font-bold mb-2">{this.state.error?.toString()}</p>
            <pre className="opacity-80 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
          </div>

          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Application
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm"
              onClick={this.handleReset}
            >
              <HardDrive className="w-4 h-4" />
              Reset State
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

