const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  runtimeCaching: [
    {
      urlPattern: ({ request }: { request: Request }) => 
      request.destination === 'document' || request.destination === 'script',
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages",
        expiration: {
          maxAgeSeconds: 300,         // ۵ دقیقه
          purgeOnQuotaError: true,
        },
      },
    },
    {
      urlPattern: ({ request }: { request: Request }) => 
      request.destination === 'document' || request.destination === 'script',
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxAgeSeconds: 30 * 24 * 60 * 60, // ۳۰ روز
          maxEntries: 200,
        },
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
    },
  ],
});

module.exports = withPWA({
  images: { unoptimized: true },
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,

  generateBuildId: async () => {
    return require("crypto").randomBytes(8).toString("hex");
    // یا از nanoid: require("nanoid").nanoid()
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
});