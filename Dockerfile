FROM node:21-alpine3.19 AS Development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npx prisma generate

EXPOSE 3001

