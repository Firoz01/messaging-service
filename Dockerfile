FROM node:alpine
WORKDIR /usr/src/app

COPY package*.json .
RUN npm ci
COPY . .
COPY config.env ./
EXPOSE 5000/tcp
EXPOSE 8800/tcp

CMD ["npm","start"]