#!/bin/bash

file=~/.0/timologisi/.cache/db.json
group=contacts
cat $file | jq -rc ".[\"$group\"][].id" | fzf --preview "cat $file | jq -r '.[\"$group\"][]| select(.id==\"{}\")'"
