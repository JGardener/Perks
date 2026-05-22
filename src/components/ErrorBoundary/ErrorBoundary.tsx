import * as Sentry from "@sentry/react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.label) {
      return (
        <div role="alert">
          <p>Something went wrong in the {this.props.label} tab.</p>
        </div>
      );
    }

    return (
      <div role="alert">
        <p>Something went wrong. Please reload the page.</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}
