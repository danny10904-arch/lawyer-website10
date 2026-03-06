import React, { Component, ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import MainSite from "./pages/MainSite";
import AdminPanel from "./admin/AdminPanel";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  public state: { hasError: boolean };
  public props: { children: ReactNode };

  constructor(props: {children: ReactNode}) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
          <h1>Something went wrong.</h1>
          <p>Please check the console for details.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </ErrorBoundary>
  );
}
