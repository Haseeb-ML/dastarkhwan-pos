import React, { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || "An unexpected error occurred" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px 24px",
          maxWidth: "600px",
          margin: "40px auto",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          border: "1px solid #fed7aa",
          textAlign: "center",
          fontFamily: "inherit"
        }}>
          <div style={{ fontSize: "42px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#9a3412", marginBottom: "8px" }}>
            معذرت، اس ماڈیول کو لوڈ کرنے میں عارضی مسئلہ پیش آیا ہے
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
            Temporary issue encountered while displaying {this.props.moduleName || "this section"}.
          </p>
          <div style={{
            fontSize: "12px",
            background: "#fff7ed",
            padding: "10px 14px",
            borderRadius: "8px",
            color: "#c2410c",
            marginBottom: "20px",
            wordBreak: "break-word"
          }}>
            {this.state.errorMessage}
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: "#d56a2d",
              color: "#ffffff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(213, 106, 45, 0.25)"
            }}
          >
            🔄 صفحہ دوبارہ لوڈ کریں (Reload Page)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
