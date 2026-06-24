import { useEffect } from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';

export default function App({ Component, pageProps }: AppProps) {
 useEffect(() => {
  if ("serviceWorker" in navigator) {
    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // فقط ثبت مجدد یا چک کردن آپدیت (اختیاری - next-pwa خودش انجام میده)
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .catch((err) => console.log("SW registration failed:", err));
    });
  }
}, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}