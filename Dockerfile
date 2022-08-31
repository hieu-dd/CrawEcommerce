FROM node:16.16.0-slim
WORKDIR /app
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir /app/tiki /app/shopee /app/lazada /app/browser
COPY package.json /app
COPY base_categories.js /app
COPY browser/browser.js /app/browser
COPY tiki/index.js /app/tiki
COPY tiki/categories.js /app/tiki
COPY tiki/categories.json /app/tiki
COPY tiki/categories.html /app/tiki
COPY shopee/index.js /app/shopee
COPY shopee/categories.js /app/shopee
COPY shopee/categories.json /app/shopee
COPY shopee/categories.html /app/shopee
COPY lazada/index.js /app/lazada
COPY lazada/categories.js /app/lazada
COPY lazada/categories.json /app/lazada
COPY lazada/categories.html /app/lazada
COPY credentials.js /app
COPY util.js /app
COPY db.js /app
COPY main.js /app
RUN npm install
ENTRYPOINT node main.js