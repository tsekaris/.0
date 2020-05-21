#!/bin/sh

git init
touch index.js
touch readme.md
npx license MIT #LICENSE file
npx gitignore node #gitignore file

# Τα παρακάτω είναι για τα defaults του "npm init -y"
npm set init.author.name "Tsekaris Michael"
npm set init.author.email "tsemix@gmail.com"
npm set init.author.url "https://github.com/tsekaris/"
npm set init.license "MIT"
npm set init.version "0.0.0"
npm init -y 

npm install -D typescript  #Για το autocompletion.
npx eslint --init # Ο wizard θα εγκαταστήσει την σωστή version eslint που θα συνδυάζεται με το airbnb γιαυτό δεν κάνουμε "npm install -D eslint"

git config user.name "tsekaris"
git config user.email "tsemix@gmail.com"
git add -A
git commit -m "Initial commit."
