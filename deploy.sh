#! /bin/bash

set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | sed 's/\r$//' | awk '/=/ {print $1}' )
else
  echo "=> Preparing deploy"
  echo "Can not find .env variables"
  exit 1
fi

read -r -p "=> Are you sure you want to deploy to production? [y/N] " prompt
if ! [[ $prompt == "y" ]]; then
  rm -f app.zip
  echo "Aborted by you. Next time, type 'y' to confirm."
  exit 0
fi

echo "=> Building"

rm -f app.zip

repository=$(git remote -v | head -n1 | perl -lwne 'm{\b([^/:]+/[^/]+).git\s} and print $1')

last_commit=$(git log \
    -1 \
    --date=iso8601-strict \
    --pretty=format:"{%n  \"commit\": \"%H\",%n  \"author\": \"%aN <%aE>\",%n  \"date\": \"%ad\",%n  \"timestamp\": %at,%n  \"message\": \"%f\",%n  \"repo\": \"$repository\"%n}," \
    "$@" | \
    perl -pe 's/},/}/' | \
    perl -pe 's{\\}{\\\\}g')

if [ -f ./commits/current.json ]; then
  mv ./commits/current.json ./commits/previous.json
  echo "$last_commit" > ./commits/current.json
else
  echo "$last_commit" > ./commits/current.json
  echo "{}" > ./commits/previous.json
fi

zip -r -q app.zip . -x node_modules/\* -x .\* -x \*.zip -x \*.db

echo "=> Uploading to server"

current_date=$(date +"%Y-%m-%d")
scp -q -o LogLevel=QUIET app.zip "$SSH_SERVER:$SSH_FOLDER/$current_date-app.zip"

echo "=> Deploying on server"
echo
command="cd $SSH_FOLDER && unzip -q -o $current_date-app.zip && npm install --production && pm2 restart news-alerts"
ssh "$SSH_SERVER" 'bash -i -c "'$command'"'

rm -f app.zip
