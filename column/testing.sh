#!/bin/bash

# Λειτουργεί:
# column data.txt -t -s '|'

# Υπάρχει πρόβλημα με το tab
# column data.txt -t -s '\t' # προβληματικό
# column data.txt -t -s $'\t' # Λειτουργεί
# column data.txt -t -s "$(printf '\t')" # Λειτουργεί
# cat data.txt | tr '\t' '|' | column -t -s '|' # Λειτουργεί
cat data.txt | tr '|' '\t' | column -t -s $'\t' # Λειτουργεί
