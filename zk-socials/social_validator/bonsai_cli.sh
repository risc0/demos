#!/usr/bin/env bash

RISC0_VERSION="1.0.5"
BONSAI_API_URL="https://api.staging.bonsai.xyz"

if [ -z "$BONSAI_API_KEY" ]; then
  echo "Error: BONSAI_API_KEY environment variable is not set."
  exit 1
fi

# prompt user image id and file path
read -p "Enter the image ID: " IMAGE_ID
read -p "Enter the path to the image file: " IMAGE_FILE

# check if image file exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "Error: File '$IMAGE_FILE' not found."
  exit 1
fi

# chck if image already exists, if it does then skip
if curl -X GET -H "x-api-key: ${BONSAI_API_KEY}" -H "x-risc0-version: ${RISC0_VERSION}" "${BONSAI_API_URL}/images/upload/${IMAGE_ID}" -o /dev/null -w '%{http_code}' -s | grep -q 204; then
  echo "Image '$IMAGE_ID' already exists. Skipping upload."
else
  echo "Image '$IMAGE_ID' does not exist. Uploading..."

  # fetch upload URL
  API_RESPONSE=$(curl -X GET -H "x-api-key: ${BONSAI_API_KEY}" -H "x-risc0-version: ${RISC0_VERSION}" "${BONSAI_API_URL}/images/upload/${IMAGE_ID}")
  UPLOAD_URL=$(echo "$API_RESPONSE" | jq -r '.url')

  echo $API_RESPONSE

  # upload image file
  curl -X PUT -H "Content-Type: application/octet-stream" --data-binary "@${IMAGE_FILE}" "$UPLOAD_URL"

  if [ $? -eq 0 ]; then
    echo "Image '$IMAGE_ID' uploaded successfully."
  else
    echo "Error uploading image '$IMAGE_ID'."
    exit 1
  fi
fi
