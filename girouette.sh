#!/bin/bash

echo ""
echo "Start Girouette..."
echo ""

[[ $(docker network ls --format "{{.Name}}" | grep 'girouette' | wc -l) == "0" ]] && docker network create girouette
[[ $(docker volume ls --format "{{.Name}}" | grep girouette | wc -l) == "0" ]] && docker volume create girouette

[[ $(docker ps --format "{{.Names}}" | grep girouette | wc -l) == "1" ]] && docker stop girouette
[[ $(docker ps -a --format "{{.Names}}" | grep girouette | wc -l) == "1" ]] && docker rm girouette

[[ $(docker images --format "{{.Repository}}" | grep "apoutchika/girouette" | wc -l ) == 1 ]] && docker rmi apoutchika/girouette

docker run \
  --restart="always" \
  --name girouette \
  -d \
  -p 80:80 \
  -p 443:443 \
  --network girouette \
  -v "girouette:/data" \
  -v "/var/run/docker.sock:/var/run/docker.sock" \
  --label girouette.domains="girouette.devel:8080" \
  apoutchika/girouette

echo ""
echo "####################################################################"
echo "##                                                                ##"
echo "##  1) Download certificate : http://girouette.devel/certificate  ##"
echo "##                                                                ##"
echo "##  And add certificate Autority to navigator :                   ##"
echo "##  - Chrome : chrome://settings/certificates                     ##"
echo "##  - Firefox: about:preferences#privacy                          ##"
echo "##                                                                ##"
echo "##  2) Go to dashboard: https://girouette.devel                   ##"
echo "##                                                                ##"
echo "####################################################################"
echo ""
