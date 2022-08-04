FROM node:16.16.0-slim
WORKDIR /app
RUN mkdir /app/tiki
COPY package.json /app
COPY tiki/index.js /app/tiki
COPY credentials.js /app
COPY db.js /app
COPY main.js /app
RUN npm install
ENTRYPOINT node main.js