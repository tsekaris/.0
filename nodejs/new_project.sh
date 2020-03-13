#!/bin/sh

touch index.js
npm init 
npm install -D eslint #Αν εγκαταστήσω global ο wizard θα το  εγκαταστήσει και local.
npm install -D typescript  #Για το autocompletion του ale.
npx eslint --init
