import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
            id="raychat-widget"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.RAYCHAT_TOKEN = "4c6ffc17-ba3d-4eab-b3e0-8b4eaca2f481"; // Replace with your actual RayChat token
                (function () {
                  var d = document;
                  var s = d.createElement("script");
                  s.src = "https://widget-react.raychat.io/install/widget.js";
                  s.async = true;
                  d.getElementsByTagName("head")[0].appendChild(s);
                })();
              `,
            }}
          />
      </body>
    </Html>
  );
}