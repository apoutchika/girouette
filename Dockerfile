FROM node:latest

COPY ./app /app
COPY ./front /front

RUN cd /app && npm i
RUN cd /front && npm i && npm run build

WORKDIR /app

EXPOSE 80 8080 443 5353
CMD node index.js
