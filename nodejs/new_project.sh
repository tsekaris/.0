#!/bin/sh

git init
touch index.js
npx license MIT #LICENSE file
npx gitignore node #gitignore file

# Τα παρακάτω είναι για τα defaults του "npm init -y"
npm set init.author.name "Tsekaris Michael"
npm set init.author.email "tsemix@gmail.com"
npm set init.author.url "https://github.com/tsekaris/"
npm set init.license "MIT"
npm set init.version "0.0.0"
npm init -y 

npm install -D eslint #Αν εγκαταστήσω global ο wizard θα το  εγκαταστήσει και local.
npm install -D typescript  #Για το autocompletion.
npx eslint --init

git config user.name "tsekaris"
git config user.email "tsemix@gmail.com"
git add -A
git commit -m "Initial commit."
