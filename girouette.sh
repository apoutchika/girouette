#!/bin/bash

echo ""
echo "Clean old Girouette install..."
echo ""

[[ $(docker network ls --format "{{.Name}}" | grep 'girouette' | wc -l) == "0" ]] && docker network create girouette
[[ $(docker volume ls --format "{{.Name}}" | grep 'girouette' | wc -l) == "0" ]] && docker volume create girouette

[[ $(docker ps --format "{{.Names}}" | grep 'girouette' | wc -l) == "1" ]] && docker stop girouette
[[ $(docker ps -a --format "{{.Names}}" | grep 'girouette' | wc -l) == "1" ]] && docker rm girouette

[[ $(docker images --format "{{.Repository}}" | grep "apoutchika/girouette" | wc -l ) == "1" ]] && docker rmi apoutchika/girouette


echo ""
echo "Prepare new install..."
echo ""

docker volume create girouette_install

function run_node () {
  docker run --rm -ti -v "girouette_install:/app" node:latest bash -c "${1}"
}


CONFIGURE=$(cat <<EOF
const fs = require('fs')
const inquirer = require('inquirer')

inquirer.prompt([
{
  type: 'input',
  name: 'tlds',
  message: 'Domain extensions to redirect in localhost (commat separed) : ',
  default: () => '.devel,.local'
}
]).then(answers => {
  const tlds = answers.tlds
                      .split(',')
                      .map(tld => tld.replace(/^\\\\./, ''))
  fs.writeFileSync('/app/tlds', tlds.join(',') + \"\\\\n\" + tlds[0])
})
EOF
)

run_node "cd /app && npm install inquirer && node -e \"${CONFIGURE}\""


TLDS=$(run_node "cat /app/tlds" | head -1)
TLD=$(run_node "cat /app/tlds" | tail -1)
docker volume rm girouette_install

docker run \
  --restart="always" \
  --name girouette \
  --dns=1.1.1.1 \
  -d \
  -p 80:80 \
  -p 443:443 \
  -p 53:5353 \
  -p 53:5353/udp \
  --network girouette \
  -e TLDS=${TLDS} \
  -v "girouette:/data" \
  -v "/var/run/docker.sock:/var/run/docker.sock" \
  --label girouette.domains="girouette.${TLD}:8080" \
  apoutchika/proxy

echo "####################################################################"
echo "##                                                                ##"
echo "##  1) Download certificate : http://girouette.${TLD}/certificate  ##"
echo "##                                                                ##"
echo "##  And add certificate Autority to navigator :                   ##"
echo "##  - Chrome : chrome://settings/certificates                     ##"
echo "##  - Firefox: about:preferences#privacy                          ##"
echo "##                                                                ##"
echo "##  2) Go to dashboard: https://girouette.${TLD}                   ##"
echo "##                                                                ##"
echo "####################################################################"
echo ""
