import React from "react";
import { AlertCircle, Download } from "lucide-react";
import { withTranslation, WithTranslation } from "react-i18next";
import { version } from "@/conf/bootstrap.ts";
import { getMemoryPerformance } from "@/utils/app.ts";
import { Button } from "@/components/ui/button.tsx";
import { saveAsFile } from "@/utils/dom.ts";

type ErrorBoundaryProps = { children: React.ReactNode } & WithTranslation;

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { errorCaught: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { errorCaught: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { errorCaught: error };
  }

  render() {
    const { t } = this.props;
    const ua = navigator.userAgent || "unknown";
    const memory = getMemoryPerformance();
    const time = new Date().toLocaleString();
    const stamp = new Date().getTime();
    const path = window.location.pathname;

    const message = `Raised-Path: ${path}\nApp-Version: ${version}\nMemory-Usage: ${
      !isNaN(memory) ? memory.toFixed(2) + " MB" : "unknown"
    }\nLocale-Time: ${time}\nError-Message: ${
      this.state.errorCaught?.message || "unknown"
    }\nUser-Agent: ${ua}\nStack-Trace: ${
      this.state.errorCaught?.stack || "unknown"
    }`;

    return this.state.errorCaught ? (
      <div className={`error-boundary`}>
        <AlertCircle className={`h-12 w-12 mt-4 mb-6`} />
        <p className={`select-none text-2xl mb-4`}>{t("fatal")}</p>
        <div className={`error-provider`}>
          <p>Raised-Path: {path}</p>
          <p>App-Version: {version}</p>
          <p>
            Memory-Usage:{" "}
            {!isNaN(memory) ? memory.toFixed(2) + " MB" : "unknown"}
          </p>
          <p>Locale-Time: {time}</p>
          <p>Error-Message: {this.state.errorCaught.message}</p>
          <p>User-Agent: {ua}</p>
        </div>
        <div className={`error-action mt-4 mb-4`}>
          <Button onClick={() => saveAsFile(`error-${stamp}.log`, message)}>
            <Download className={`h-4 w-4 mr-2`} />
            {t("download-fatal-log")}
          </Button>
        </div>
        <div className={`error-tips select-none align-center`}>
          <p>{t("fatal-tips")}</p>
        </div>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default withTranslation()(ErrorBoundary);
