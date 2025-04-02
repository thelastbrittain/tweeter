#!/bin/bash

# Define the source directory and zip file name
SOURCE_DIR="./dist/src"
ZIP_FILE="dist.zip"

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Source directory $SOURCE_DIR does not exist."
  exit 1
fi

# delete zip if it already exists
if [ -f "$ZIP_FILE" ]; then
  echo "$ZIP_FILE already exists. Deleting it."
  rm "$ZIP_FILE"
fi

# Navigate into the source directory
cd "$SOURCE_DIR" || exit

# Zip all contents of the current directory without including the parent folder
zip -r "../$ZIP_FILE" ./*

# Move the zip file to the same level as the dist folder and script
mv "../$ZIP_FILE" "../../$ZIP_FILE"

echo "Zipping complete. $ZIP_FILE has been moved to the same level as the dist folder and script."

# Run ./uploadLambdas.sh

cd ../../
pwd
ls

echo "Running uploadLambdas.sh..."
if [ -x "uploadLambdas.sh" ]; then
  ./uploadLambdas.sh
else
  echo "uploadLambdas.sh is not executable or not found."
  exit 1
fi

echo "Sleeping for 3 seconds to not cause conflicts" 
sleep 3 

# Run ./updateLayers.sh
echo "Running updateLayers.sh..."
if [ -x "updateLayers.sh" ]; then
  ./updateLayers.sh
else
  echo "updateLayers.sh is not executable or not found."
  exit 1
fi

