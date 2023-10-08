#!/bin/bash
cd /Users/egor/Dev/linkedinbot

npm start

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Define the parameters for the request
email=$EMAIL
password=$PASSWORD
sheetTitle=$SHEET_TITLE
sheetLink=$SHEET_LINK
numberOfTargetProfiles=$NUMBER_OF_TARGET_PROFILES

# Check if required variables are set
if [ -z "$email" ] || [ -z "$password" ] || [ -z "$sheetTitle" ] || [ -z "$sheetLink" ] || [ -z "$numberOfTargetProfiles" ]; then
  echo "Required environment variables are missing"
  exit 1
fi

# Encode the sheetLink parameter
encodedSheetLink=$(echo "$sheetLink" | sed 's/\//%2F/g')

# Build the URL
url="http://localhost:$PORT/api/sheetsConnect?email=$email&password=$password&sheetTitle=$sheetTitle&sheetLink=$encodedSheetLink&numberOfTargetProfiles=$numberOfTargetProfiles"

# Print the URL for reference
echo "URL: $url"

# Run the HTTP request using curl
response=$(curl -s "$url")

# Print the response
echo "Response:"
echo "$response"
