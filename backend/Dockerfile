FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

ENV MONGO_URI=mongodb://mongo:27017/ipdb

CMD ["node", "server.js"]