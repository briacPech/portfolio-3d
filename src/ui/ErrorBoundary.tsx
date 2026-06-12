import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          backgroundColor: "#0A192F", color: "white", zIndex: 9999, fontFamily: "sans-serif"
        }}>
          <h1>Oups, le voyage a été interrompu !</h1>
          <p>Le moteur 3D a rencontré une erreur fatale.</p>
          <button 
            style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer", border: "none", borderRadius: "5px", backgroundColor: "#00d2ff" }}
            onClick={() => window.location.reload()}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
