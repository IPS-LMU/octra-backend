#! /bin/bash
# Shell script for easy tests via terminal

echo "Load config..."
# Load config file...
. ./octra_api_easy_local.cfg

# global variables that are going to be overwritten
jwt=""

run_get_auth() {
  local command=$1
  result=$(curl -sS -H -X GET  "Accept: application/json" -H "Content-Type: application/json" -H "X-App-Token: $app_token" -H "Origin: http://localhost:8080" -H "Authorization: Bearer $jwt" "${host}$command")
  echo "$result" | grep -e "{\""
}

run_post_auth() {
  local command=$1
  local data=$2
  result=$(curl -sS -H "Accept: application/json" -X POST -H "Content-Type: application/json" -H "X-App-Token: $app_token" -H "Origin: http://localhost:8080" -H "Authorization: Bearer $jwt" "${host}$command" -d "$data")
  echo "$result" | grep -e "{\""
}

run_put_auth() {
  local command=$1
  local data=$2
  result=$(curl -sS -X PUT -H "Accept: application/json" -H "Content-Type: application/json" -H "X-App-Token: $app_token" -H "Origin: http://localhost:8080" -H "Authorization: Bearer $jwt" "${host}$command" -d "$data")
  echo "$result" | grep -e "{\""
}

run_delete_auth() {
  local command=$1
  result=$(curl -sS -X DELETE -H "Accept: application/json" -H "Content-Type: application/json" -H "X-App-Token: $app_token" -H "Origin: http://localhost:8080" -H "Authorization: Bearer $jwt" "${host}$command")
  echo "$result" | grep -e "{\""
}

run_post() {
  local command=$1
  local data=$2
  result=$(curl -sS -i -H "Accept: application/json" -H "Content-Type: application/json" -H "X-App-Token: $app_token" -H "Origin: http://localhost:8080" "${host}$command" -d "$data")
  echo "$result" | grep -e "{\""
}

upload_files_auth() {
  local command=$1
  local file1=$2
  local file2=$3
  local properties=$4
  curl -F "inputs[]=@/Users/ips/repos/octra-backend/testfiles/WebTranscribe.wav;type=audio/wave" -F "inputs[]=@/Users/ips/repos/octra-backend/EinsZweiDrei.txt;type=text/plain" -F "transcriptType=Text" -F "transcript=Text" -F "properties=$properties" -H "Content-Type: multipart/form-data" -H "Accept: application/json" -H "X-App-Token: $app_token" -H "Origin: http://localhost:8080" -H "Authorization: Bearer $jwt" "${host}$command"
}

echo "Authenticate...\n"
login_result=$(run_post "/auth/login" "{\"type\": \"local\", \"username\": \"$username\", \"password\": \"$password\"}")

echo "Authentication token:"
jwt=$(echo $login_result | grep -e "access_token" | sed -E 's/.*"access_token":"([^"]+).*/\1/')
echo "$jwt"

account_id=$(echo $login_result | grep -e "access_token" | sed -E 's/.*"account_id":"([^"]+).*/\1/')
echo "Account ID: $account_id"

echo "\nRun GET /account/current:"
run_get_auth "/account/current"

echo "\nRun UPLOAD /projects/977/tasks:"
upload_files_auth "/projects/977/tasks" "$audiofile" "$transcript" '{"type":"annotation","orgtext":"asdas"}'
