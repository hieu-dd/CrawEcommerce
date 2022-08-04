FROM node:16.16.0-slim
WORKDIR /app
COPY package.json /app
COPY main.js /app
RUN npm install
ENTRYPOINT node main.js

