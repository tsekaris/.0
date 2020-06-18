#!/bin/bash

cd $(dirname "$0")
mkdir .tmp
cd .tmp

curl -L https://docs.google.com/spreadsheets/d/1cYj-FcsDkrFxuuJbMdYLBFUlxwNe0kc-QFCOBbAuV3w/export?exportFormat=csv > abb.csv

# Το -L χρειάζεται

sqlite3 abb.db ".read ../import_commands.txt"
