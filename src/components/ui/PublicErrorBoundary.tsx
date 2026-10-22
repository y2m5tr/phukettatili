import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class PublicErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[PublicErrorBoundary] Caught non-fatal error in public island:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            {this.props.fallbackTitle || 'Bu içerik şu anda yüklenemedi'}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {this.props.fallbackMessage || 'Kısa bir bağlantı aksaklığı yaşanmış olabilir.'}
          </p>

          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tekrar Dene</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
