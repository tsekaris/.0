#!/bin/bash

# Install όλα τα dependencies που είναι στο package.json

ui "Εγκατάσταση των development dependencies;" "yes" "no" "quit"

case $ui in
  yes )
    npm install 
    ;;
  no )
    npm install --production
    ;;
esac
