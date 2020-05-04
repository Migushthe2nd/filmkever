#!/bin/bash

pm2 stop filmkever
pm2 delete filmkever
git pull
npm install
npm run build
pm2 start ./filmkever.config.js
pm2 save