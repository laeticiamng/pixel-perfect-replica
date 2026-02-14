import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentLocale, translations } from '@/lib/i18n/translations';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const locale = getCurrentLocale();

      return (
        <div className="min-h-screen bg-gradient-radial flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {translations.errors.errorBoundaryTitle[locale]}
          </h1>
          
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            {translations.errors.errorBoundaryDesc[locale]}
          </p>
          
          {import.meta.env.DEV && this.state.error && (
            <div className="glass rounded-xl p-4 mb-6 max-w-md w-full overflow-auto">
              <p className="text-sm font-mono text-destructive">
                {this.state.error.toString()}
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={this.handleGoHome}
              className="rounded-xl focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              <Home className="mr-2 h-4 w-4" />
              {translations.errors.home[locale]}
            </Button>
            <Button
              onClick={this.handleReload}
              className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {translations.errors.reload[locale]}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
