#!/bin/sh

export HOME=/home/ubuntu

cd /usr/local/mplusmuseum/projects/mplusmuseum-graphql

sudo yarn

pm2 restart "mplusmuseum-graphql" --update-env
