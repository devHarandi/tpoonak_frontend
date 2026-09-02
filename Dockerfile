# ---- مرحله ۱: بیلد استاتیک ----
# next.config.ts روی output:"export" است، پس خروجی یک سایت کاملاً استاتیک در out/ است.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* در زمان بیلد داخل باندل نوشته می‌شود، نه در زمان اجرا.
# پس آدرس API باید حتماً build-arg باشد.
ARG NEXT_PUBLIC_API_URL=https://api.tpoonak.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# ---- مرحله ۲: سرو با nginx ----
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
