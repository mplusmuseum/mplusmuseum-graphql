#!/bin/sh

export HOME=/home/ubuntu

cd /usr/local/mplusmuseum/projects

# the deploy installs as root, so just chown all the things
sudo chown -R ubuntu:ubuntu ./mplusmuseum-graphql

cd ./mplusmuseum-graphql

yarn install

yarn build

pm2 restart "mplusmuseum-graphql" --env production --update-env
