#!/bin/bash

read -p "Εισαγωγή github link (κενό αν δεν υπάρχει):" link

if [[ -z $link  ]]
then
  read -p "Git init? [Y/n]" yn
  [[ -z $yn  ]] || [[ $yn = [Yy]* ]] && echo "--- Git init ---" && git init 
else 
  read -p "O φάκελος του νέου project θα δημιουργηθεί αυτόματα. Ok? [Y/n]." yn 
  [[ -z $yn  ]] || [[ $yn = [Yy]* ]] && echo "--- Git clone ---" && git clone $link && cd $(basename $link .git)
fi

echo "--- Creating index.js and readme.md ---"
touch index.js
touch readme.md

read -p "Δημιουργία LICENSE file ? [MIT/y/n]" answer 
if [[ -z $answer ]]; then
  echo "--- Creating a MIT LICENSE file ---"
  npx license "MIT"
elif [[ $answer = [Yy]* ]]; then
  echo "--- Creating LICENSE file with wizard---"
  npx license
else
  echo "--- No LICENSE file ---"
fi

echo "--- Creating gitignore file ---"
npx gitignore node #gitignore file

echo "--- npm init ---"
npm init

echo "--- Installing typescript ---"
npm install -D typescript  #Για το autocompletion.


echo "--- eslint wizard ---"
npx eslint --init # Ο wizard θα εγκαταστήσει την σωστή version eslint που θα συνδυάζεται με το airbnb γιαυτό δεν κάνουμε "npm install -D eslint"
