#!/usr/bin/env bash

targets="node6-linux-x64,node6-linux-x86,node6-macos-x64"
#targets="node6-macos-x64"

echo "prebuild..."
npm run prestart

echo "remove old files..."
rm -rf prod && mkdir prod

echo "build binaries..."
pkg -t $targets -o prod/sprachstand-api dist/app.prod.js

echo "Copy assets"
cp -rf views prod/views
cp -rf dist/static prod/static
cp config.json prod/config_sample.json
echo "Build finished"
