#!/bin/bash

pm2 stop filmkever
pm2 delete filmkever
git pull
yarn
yarn run build
pm2 start ./filmkever.config.js
pm2 save