#!/bin/bash

menu(){
  # IFS: σύνδεση με $* και πρέπει να είναι local.
  # $'\n': Περίεργος τρόπος για newline character.
  # --phony: απλό μενού και όχι fuzzy search.
  # menuSelection: Global variable.
  local IFS=$'\n' 
  menuSelection=$(echo "$*" |  fzf --phony)
  echo "$menuSelection"
}

echo "Εισαγωγή github link (κενό αν δεν υπάρχει): "
read link

if [[ -z $link  ]]; then
  echo "Git init? "
  menu "yes" "no" 
  [[ $menuSelection = yes ]] && git init
else 
  echo "O φάκελος του νέου project θα δημιουργηθεί αυτόματα. Ok? "
  menu "yes" "no" 
  if [[ $menuSelection = yes ]]; then
    git clone $link 
    # Παίρνει το όνομα του project.
    # Ο φάκελος θα έχει το ίδιο όνομα.
    cd $(basename $link .git)
  fi
fi

echo "Creating index.js and readme.md."
touch index.js
touch readme.md

echo "Δημιουργία LICENSE file;"
menu "mit" "wizard" "no" 

case $menuSelection in
  mit )
    npx license "MIT"
    ;;
  wizard )
    npx license
    ;;
esac

echo "Creating gitignore file."
npx gitignore node 

echo "npm init."
npm init

echo "Installing typescript."
#Για το autocompletion.
npm install -D typescript

echo "eslint wizard."
# Ο wizard θα εγκαταστήσει την σωστή version eslint που θα συνδυάζεται με το airbnb γιαυτό δεν κάνουμε "npm install -D eslint"
npx eslint --init 
