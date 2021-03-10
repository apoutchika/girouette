#!/bin/bash

echo ''
echo '     _______                       __  __     '
echo '    / ____(_)________  __  _____  / /_/ /____ '
echo '   / / __/ / ___/ __ \/ / / / _ \/ __/ __/ _ \'
echo '  / /_/ / / /  / /_/ / /_/ /  __/ /_/ /_/  __/'
echo '  \____/_/_/   \____/\__,_/\___/\__/\__/\___/ '
echo '  ____________________________________________'
echo ''
echo '        - https://www.girouette.dev -         '
echo ''

curl -X GET https://raw.githubusercontent.com/apoutchika/girouette/master/license
echo ''
echo ''


ACCEPT='null'

while [[ ${ACCEPT} != 'Y' && ${ACCEPT} != 'n' ]]
do
  echo -e "\e[1m"
  read -p "? Accept the license ? [Y/n] : " ACCEPT
  echo -e "\e[0m"
  [[ ${ACCEPT} != 'Y' && ${ACCEPT} != 'n' ]] && echo -e "\e[31mPlease set Y or n...\e[0m"
done

[[ ${ACCEPT} != 'Y' ]] && echo ";-(" && exit


echo ""
echo -e "\e[34m> Test if has docker\e[39m\n"
! docker -v &> /dev/null && echo -e "\n\e[31mDocker not found\e[39m" && exit

docker volume create girouette_install
function run_node () {
  docker run --rm -ti --network="host" -v "girouette_install:/app" node:latest bash -c "${1}"
}

echo ""
echo -e "\e[34m> Clean old Girouette install...\e[39m"

[[ $(docker network ls --format "{{.Name}}" | grep '^girouette$' | wc -l) == "0" ]] && docker network create girouette
[[ $(docker volume ls --format "{{.Name}}" | grep '^girouette$' | wc -l) == "0" ]] && docker volume create girouette

[[ $(docker ps --format "{{.Names}}" | grep '^girouette$' | wc -l) == "1" ]] && docker stop girouette
[[ $(docker ps -a --format "{{.Names}}" | grep '^girouette$' | wc -l) == "1" ]] && docker rm girouette

[[ $(docker images --format "{{.Repository}}" | grep "girouette/girouette" | wc -l ) == "1" ]] && docker rmi girouette/girouette

echo ""
echo -e "\e[34m> Test port configuration\e[39m\n"

TEST_CONFIG=$(cat <<EOF
const isPortReachable = require('is-port-reachable');
const fs = require('fs')
const chalk = require('chalk')

const test = async port => {
  if(await isPortReachable(port, {host: 'localhost'})) {
    console.log(chalk.red('> Girouette use port ' + port + ', and it not free'))
    fs.writeFileSync('/app/fail', 'FAIL')
  }
}

test(80)
test(443)
test(53)
EOF
)
run_node "cd /app && npm install is-port-reachable chalk && node -e \"${TEST_CONFIG}\""

FAIL=$(run_node "cat /app/fail")
if [[ ${FAIL} == 'FAIL' ]];
then
  docker volume rm girouette_install
  exit
fi


echo -e "\e[34m> Prepare new install...\e[39m"
echo ""




CONFIGURE=$(cat <<EOF
const fs = require('fs')
const inquirer = require('inquirer')

inquirer.prompt([
{
  type: 'input',
  name: 'tlds',
  message: 'Domain extensions for redirect to Girouette (commat separed) : ',
  default: () => '.devel'
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
  fs.writeFileSync('/app/dnsmasq', answers.tlds.split(',').join('\\\\n'))
  fs.writeFileSync('/app/tlds', answers.tlds.split(',').map(tld => 'address=/.' + tld + '/127.0.0.1').join('\\\\n'))
  fs.writeFileSync('/app/dns', answers.dns)
})
EOF
)

run_node "cd /app && npm install inquirer && node -e \"${CONFIGURE}\""


DNSMASQ=$(run_node "cat /app/dnsmasq")
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
  -p 127.0.0.1:53:5353 \
  -p 127.0.0.1:53:5353/udp \
  --network girouette \
  -e DNS=${DNS} \
  -e TLD=${TLD} \
  -e TLDS=${TLDS} \
  -e DNSMASQ=${DNSMASQ} \
  -v "girouette:/data" \
  -v "/var/run/docker.sock:/var/run/docker.sock" \
  --label girouette.domains="girouette.${TLD}:8080" \
  --label girouette.group="Girouette" \
  girouette/girouette

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
