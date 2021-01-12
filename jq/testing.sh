#!/bin/bash

file=~/.0/timologisi/.cache/db.json
group=contacts
cat $file | jq -c ".[\"$group\"][].id" | fzf --preview "cat $file | jq '.[\"$group\"][]| select(.id==\"{}\")'"



