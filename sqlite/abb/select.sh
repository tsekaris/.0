#!/bin/bash

ui "amper:"
sqlite3 $HOME/.0/sqlite/.tmp/abb.db "select search, id, type, price from devices where a_min <= ${ui} and a_max >= ${ui}" | fzf -e
