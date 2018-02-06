#!/bin/sh

export HOME=/home/ubuntu

cd /usr/local/mplusmuseum/projects/mplusmuseum-graphql

sudo yarn
sudo yarn build

pm2 restart "graphql"
