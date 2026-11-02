/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcfbfb] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-6 rounded-2xl border border-[#f0dbe5] shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#faeef2] border border-[#f0dbe5] text-[#c082a0] flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="font-serif-brand font-bold text-lg text-stone-900">
              Ops! Houve uma atualização
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Os dados locais precisavam ser sincronizados com a nova versão do calendário.
            </p>
            <button
              onClick={this.handleReset}
              className="py-2.5 px-5 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Atualizar e Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
