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

console.log('') // space
console.log('') // space
inquirer.prompt([
{
  type: 'input',
  name: 'tlds',
  message: 'Domain extensions for redirect to Girouette (commat separed) : ',
  default: () => '.devel,.local'
},
{
  type: 'input',
  name: 'dns',
  message: 'Choose your preferred dns server (commat separed) : ',
  default: () => '1.1.1.1'
}
]).then(answers => {
  console.log('') // space

  answers.tlds = answers.tlds.split(',').map(tld => tld.replace(/^\\\\./, '')).join(',')

  fs.writeFileSync('/app/tld', answers.tlds.split(',')[0])
  fs.writeFileSync('/app/tlds', answers.tlds)
  fs.writeFileSync('/app/dns', answers.dns)
})
EOF
)

run_node "cd /app && npm install inquirer && node -e \"${CONFIGURE}\""


TLDS=$(run_node "cat /app/tlds")
TLD=$(run_node "cat /app/tld")
DNS=$(run_node "cat /app/dns")

docker volume rm girouette_install

docker run \
  --restart="always" \
  --name girouette \
  --dns=${DNS} \
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
  apoutchika/girouette

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
