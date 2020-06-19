FROM node:latest

COPY ./app /app

RUN npm i -g nodemon
WORKDIR /app

EXPOSE 80 8080 443
CMD nodemon index.js
