#!/bin/sh

export HOME=/home/ubuntu

cd /usr/local/mplusmuseum/projects/mplusmuseum-graphql

sudo npm install

sudo npm run build

pm2 restart "mplusmuseum-graphql" --update-env
