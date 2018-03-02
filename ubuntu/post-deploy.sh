#!/bin/sh

export HOME=/home/ubuntu

cd /usr/local/mplusmuseum/projects/mplusmuseum-graphql

yarn install

yarn build

pm2 restart "mplusmuseum-graphql" --env production --update-env
