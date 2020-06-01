#!/bin/bash

termux-setup-storage # Για να βλέπω τους φακέλους του κινητού
[ ! -d $HOME/.0/.tmp ] && mkdir $HOME/.0/.tmp

# building tools. Απαραίτητο πχ από node-sqlite3
pkg install build-essential
