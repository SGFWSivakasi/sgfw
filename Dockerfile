FROM ghcr.io/puppeteer/puppeteer:21.1.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/render/project/src/.cache/puppeteer/chrome/linux-116.0.5845.96/chrome-linux/chrome.exe

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node","./bin/www"]