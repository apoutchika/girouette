#!/bin/bash

echo ""
echo "Start proxy..."
echo ""

[[ $(docker network ls --format "{{.Name}}" | grep 'proxy' | wc -l) == "0" ]] && docker network create proxy
[[ $(docker volume ls --format "{{.Name}}" | grep proxy | wc -l) == "0" ]] && docker volume create proxy

[[ $(docker ps --format "{{.Names}}" | grep proxy | wc -l) == "1" ]] && docker stop proxy
[[ $(docker ps -a --format "{{.Names}}" | grep proxy | wc -l) == "1" ]] && docker rm proxy

[[ $(docker images --format "{{.Repository}}" | grep "apoutchika/proxy" | wc -l ) == 1 ]] && docker rmi apoutchika/proxy

docker run \
  --restart="always" \
  --name proxy \
  -d \
  -p 80:80 \
  -p 443:443 \
  --network proxy \
  -v "proxy:/data" \
  -v "/var/run/docker.sock:/var/run/docker.sock" \
  --label proxy.domains="proxy.devel:8080" \
  apoutchika/proxy

echo ""
echo "################################################################"
echo "##                                                            ##"
echo "##  1) Download certificate : http://proxy.devel/certificate  ##"
echo "##                                                            ##"
echo "##  And add certificate Autority to navigator :               ##"
echo "##  - Chrome : chrome://settings/certificates                 ##"
echo "##  - Firefox: about:preferences#privacy                      ##"
echo "##                                                            ##"
echo "##  2) Go to dashboard: https://proxy.devel                   ##"
echo "##                                                            ##"
echo "################################################################"
echo ""
