FROM node:16.16.0-slim
WORKDIR /app
RUN mkdir /app/tiki /app/shopee /app/lazada
COPY package.json /app
COPY base_categories.js /app
COPY tiki/index.js /app/tiki
COPY tiki/categories.js /app/tiki
COPY tiki/categories.json /app/tiki
COPY tiki/categories.html /app/tiki
COPY shopee/index.js /app/shopee
COPY shopee/categories.js /app/shopee
COPY shopee/categories.json /app/shopee
COPY shopee/categories.html /app/shopee
COPY lazada/index.js /app/lazada
COPY credentials.js /app
COPY util.js /app
COPY db.js /app
COPY main.js /app
RUN npm install
ENTRYPOINT node main.js