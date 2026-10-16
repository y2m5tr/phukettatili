import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  tabName?: string;
  onResetToOverview?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 my-6 bg-white dark:bg-surface-2 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-lg text-center max-w-2xl mx-auto animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {this.props.tabName ? `"${this.props.tabName}" Sekmesinde Bir Sorun Oluştu` : 'Bu Bölüm Yüklenirken Bir Hata Oluştu'}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Operasyon verileri işlenirken beklenmeyen bir hata yakalandı. Sayfa çökmesi engellendi ve paneliniz güvende.
          </p>

          {this.state.error?.message && (
            <div className="mb-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-rose-600 dark:text-rose-400 text-left overflow-x-auto">
              Hata: {this.state.error.message}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tekrar Dene</span>
            </button>

            {this.props.onResetToOverview && (
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onResetToOverview!();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Genel Bakışa Dön</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
