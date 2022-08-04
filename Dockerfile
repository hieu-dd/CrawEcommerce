FROM node:16.16.0-slim
WORKDIR /app
RUN mkdir /app/tiki /app/shopee /app/lazada
COPY package.json /app
COPY tiki/index.js /app/tiki
COPY shopee/index.js /app/shopee
COPY lazada/index.js /app/lazada
COPY credentials.js /app
COPY db.js /app
COPY main.js /app
RUN npm install
ENTRYPOINT node main.js