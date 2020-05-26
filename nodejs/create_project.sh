#!/bin/bash

ui "Εισαγωγή github link (κενό αν δεν υπάρχει): "
if [[ -z $ui  ]]; then
  ui "Git init? " "yes" "no" 
  [[ $ui = yes ]] && git init
else 
  ui "O φάκελος του νέου project θα δημιουργηθεί αυτόματα. Ok? " "yes" "no" 
  if [[ $ui = yes ]]; then
    git clone $link
    cd $(basename $link .git)
  fi
fi

ui "Δημιουργία LICENSE file;" "mit" "wizard" "no" 
case $ui in
  mit )
    npx license "MIT"
    ;;
  wizard )
    npx license
    ;;
esac

ui "Δημιουργία .gitignore, index.js και readme.md;" "yes" "no"
if [[ $ui = yes ]]; then
  touch index.js
  touch readme.md 
  touch .gitignore
fi

echo "npm init."
npm init

ui "Install typescript για autocompletion;" "yes" "no"
[[ $ui = yes ]] && npm install -D typescript

ui "eslint wizard;" "yes" "no"
[[ $ui = yes ]] && npx eslint --init 
# Ο wizard θα εγκαταστήσει την σωστή version eslint που θα συνδυάζεται με το airbnb γιαυτό δεν κάνουμε "npm install -D eslint"
