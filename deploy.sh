#! /bin/bash

set -eum

if [ -f .env ]; then
    export $(grep -v '^#' .env | sed 's/\r$//' | awk '/=/ {print $1}' )
else
  echo "=> Preparing deploy"
  echo "Can not find .env variables"
  exit 1
fi

echo "=> Building"

rm -f app.zip

zip -r -q app.zip . -x node_modules/\* -x .\* -x \*.zip -x \*.db

echo "=> Uploading server part via SSH"

current_date=$(date +"%Y-%m-%d")
scp -q -o LogLevel=QUIET app.zip "$SSH_SERVER:$SSH_FOLDER/$current_date-app.zip"

# read -r -p "=> Are you sure you want to deploy to production? [y/N] " prompt
# if ! [[ $prompt == "y" ]]; then
#   rm -f app.zip
#   echo "Aborted by you. Next time, type 'y' to confirm."
#   exit 0
# fi

# echo "=> Deploying"
# echo
# command="cd $SSH_FOLDER && unzip -q -o $current_date-app.zip && npm install --production && pm2 restart news-alerts"
# ssh "$SSH_SERVER" 'bash -i -c "'$command'"'

# rm -f app.zip
