#!/bin/bash

cd $(dirname "$0")
ui "amper:"
amper=$ui
type=$(sqlite3 .tmp/abb.db "select distinct type from devices where a_min <= '${amper}' and a_max >= '${amper}'" | fzf -e)
poles=$(sqlite3 .tmp/abb.db "select distinct poles from devices where type = '${type}' and a_min <= '${amper}' and a_max >= '${amper}'" | fzf -e)
filter=$(sqlite3 .tmp/abb.db "select distinct filter from devices where type = '${type}' and poles = '${poles}' and a_min <= '${amper}' and a_max >= '${amper}'" | fzf -e)
sqlite3 .tmp/abb.db "select id, name, price from devices where type = '${type}' and poles = '${poles}' and filter = '${filter}' and a_min <= '${amper}' and a_max >= '${amper}' " | fzf -e
