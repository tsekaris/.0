#!/bin/sh

touch index.js
npm init 
npm install -D eslint #Αν εγκαταστήσω global ο wizard θα το  εγκαταστήσει και local.
npm install -D typescript  #Αν εγκαταστήσω global ο wizard θα το  εγκαταστήσει και local.
npx eslint --init
