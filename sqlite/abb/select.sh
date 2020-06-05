#!/bin/bash

ui "amper:"
sqlite3 ../.tmp/abb.db "select search, id, type, price from devices where a_min < ${ui} and a_max > ${ui}" | fzf -e
