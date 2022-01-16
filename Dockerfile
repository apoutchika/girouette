FROM node:16

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
      dnsmasq \
      supervisor

RUN rm -rf /var/lib/apt/lists/*

RUN echo "conf-dir=/etc/dnsmasq.d" >> /etc/dnsmasq.conf
RUN echo "user=root" >> /etc/dnsmasq.conf
RUN echo "cache-size=10000" >> /etc/dnsmasq.conf

COPY ./app /app
COPY ./front /front
COPY ./supervisor.conf /supervisor.conf


RUN cd /app && npm i
RUN cd /front && npm i && npm run build

WORKDIR /app

EXPOSE 80 8080 443 5353
CMD supervisord -c /supervisor.conf
