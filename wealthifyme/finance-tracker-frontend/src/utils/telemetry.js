// telemetry.js — GDPR-compliant lightweight telemetry logging for user actions and routing

export const getConsentStatus = () => {
  return localStorage.getItem("wm-cookie-consent") === "accepted";
};

export const logTelemetryEvent = (eventName, data = {}) => {
  if (!getConsentStatus()) {
    // Telemetry blocked since GDPR cookie consent is not granted or refused
    return;
  }

  // Create clean console logs as lightweight telemetry output
  console.log(
    `%c[📊 Telemetry] %cEvent: ${eventName}`,
    "color: #0d9488; font-weight: bold;",
    "color: #1e293b;",
    {
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      ...data,
    }
  );
};
