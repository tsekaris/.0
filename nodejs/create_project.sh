#!/bin/bash

menu(){
  menuSelection=$(echo $@ | tr ' ' '\n' | fzf)
}

read -p "Εισαγωγή github link (κενό αν δεν υπάρχει):" link

if [[ -z $link  ]]
then
  echo "Git init?"
  menu "yes" "no" 
  [[ $menuSelection = yes ]] && echo "--- Git init ---" && git init 
else 
  echo "O φάκελος του νέου project θα δημιουργηθεί αυτόματα. Ok?"
  menu "yes" "no" 
  [[ $menuSelection = yes ]] && echo "--- Git clone ---" && git clone $link && cd $(basename $link .git)
fi

echo "--- Creating index.js and readme.md ---"
touch index.js
touch readme.md

echo "Δημιουργία LICENSE file ?"
menu "mit" "wizard" "no" 

case $menuSelection in
  mit)
    echo "--- Creating a MIT LICENSE file ---"
    npx license "MIT"
    ;;
  wizard)
    echo "--- Creating LICENSE file with wizard---"
    npx license
    ;;
  *)
    echo "--- No LICENSE file ---"
    ;;
esac

echo "--- Creating gitignore file ---"
npx gitignore node #gitignore file

echo "--- npm init ---"
npm init

echo "--- Installing typescript ---"
npm install -D typescript  #Για το autocompletion.


echo "--- eslint wizard ---"
npx eslint --init # Ο wizard θα εγκαταστήσει την σωστή version eslint που θα συνδυάζεται με το airbnb γιαυτό δεν κάνουμε "npm install -D eslint"
