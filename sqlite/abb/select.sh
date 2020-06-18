#!/bin/bash

cd $(dirname "$0")
type=$(sqlite3 .tmp/abb.db "select distinct type from devices" | fzf -e)
poles=$(sqlite3 .tmp/abb.db "select distinct poles from devices where type = '${type}'" | fzf -e)
filter=$(sqlite3 .tmp/abb.db "select distinct filter from devices where type = '${type}' and poles = '${poles}'" | fzf -e)

ui "amper:"
sqlite3 .tmp/abb.db "select id, name, price from devices where type = '${type}' and poles = '${poles}' and filter = '${filter}' and a_min <= '${ui}' and a_max >= '${ui}' " | fzf -e
