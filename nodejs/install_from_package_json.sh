#!/bin/bash

# Install όλα τα dependencies που είναι στο package.json

menu(){
  # IFS: σύνδεση με $* και πρέπει να είναι local.
  # $'\n': Περίεργος τρόπος για newline character.
  # --phony: απλό μενού και όχι fuzzy search.
  # menuSelection: Global variable.
  local IFS=$'\n' 
  menuSelection=$(echo "$*" |  fzf --phony)
}

echo "Εγκατάσταση των development dependencies; "
menu "yes" "no" "quit"

case $menuSelection in
  yes )
    npm install 
    ;;
  no )
    npm install --production
    ;;
esac
