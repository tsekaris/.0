#!/bin/bash

ui(){
  #ui: user interface
  while [[ true ]]; do
    # Το fzf θέλει στήλες.
    # IFS: σύνδεση με $* και πρέπει να είναι local.
    # $'\n': Περίεργος τρόπος για newline character.
    local IFS=$'\n' 
    # Global variable
    uiValue=$(echo "$*" |  fzf )
    if [[ -z $uiValue ]]; then
      echo "Try again."
    else
      echo "$uiValue"
      break;
    fi
  done
}

echo "Εισαγωγή github link (κενό αν δεν υπάρχει): "
read link
if [[ -z $link  ]]; then
  echo "Git init? "
  ui "yes" "no" 
  [[ $uiValue = yes ]] && git init
else 
  echo "O φάκελος του νέου project θα δημιουργηθεί αυτόματα. Ok? "
  ui "yes" "no" 
  [[ $uiValue = yes ]] && git clone $link; cd $(basename $link .git)
fi

echo "Δημιουργία gitingnore file;"
ui "yes" "no"
[[ $uiValue = yes ]] && npx gitignore node 

echo "Δημιουργία LICENSE file;"
ui "mit" "wizard" "no" 
case $uiValue in
  mit )
    npx license "MIT"
    ;;
  wizard )
    npx license
    ;;
esac

echo "Δημιουργία  index.js και readme.md;"
ui "yes" "no"
if [[ $uiValue = yes ]]; then
  touch index.js
  touch readme.md 
fi

echo "npm init."
npm init

echo "Install typescript για autocompletion;"
ui "yes" "no"
[[ $uiValue = yes ]] && npm install -D typescript

echo "eslint wizard;"
ui "yes" "no"
[[ $uiValue = yes ]] && npx eslint --init 
# Ο wizard θα εγκαταστήσει την σωστή version eslint που θα συνδυάζεται με το airbnb γιαυτό δεν κάνουμε "npm install -D eslint"
