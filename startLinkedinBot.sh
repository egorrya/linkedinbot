#!/bin/bash
cd /Users/egor/Dev/linkedinbot

# Start your Next.js application in the background
caffeinate -s npm start &

# Sleep for a few seconds to allow the Next.js application to start
sleep 5

# Load environment variables from .env
if [ -f .env-sh ]; then
  export $(grep -v '^#' .env-sh | xargs)
fi

# Define the parameters for the request
email=$EMAIL
password=$PASSWORD
sheetTitle=$SHEET_TITLE
sheetLink=$SHEET_LINK
numberOfTargetProfiles=$NUMBER_OF_TARGET_PROFILES
filterOpenToWork=$FILTER_OPEN_TO_WORK
namesToSkip=$NAMES_TO_SKIP

# Print the parameters for reference
echo "Parameters:"
echo "email: $email"
echo "sheetTitle: $sheetTitle"
echo "sheetLink: $sheetLink"
echo "numberOfTargetProfiles: $numberOfTargetProfiles"
echo "filterOpenToWork: $filterOpenToWork"

# Check if required variables are set
if [ -z "$email" ] || [ -z "$password" ] || [ -z "$sheetTitle" ] || [ -z "$sheetLink" ] || [ -z "$numberOfTargetProfiles" ]; then
  echo "Required environment variables are missing"
  exit 1
fi

# Build the URL
url="http://localhost:8080/api/sheetsConnect?email=$email&password=$password&sheetTitle=$sheetTitle&sheetLink=$sheetLink&numberOfTargetProfiles=$numberOfTargetProfiles&filterOpenToWork=$filterOpenToWork&namesToSkip=$namesToSkip"

# Print the URL for reference
echo "Sending request"

# Run the HTTP request using curl
response=$(curl -s "$url")

# Print the response
echo "Response:"
echo "$response"

# Kill 8080 port
kill -9 $(lsof -t -i:8080)

# Exit in 20 seconds
sleep 20
exit 0