#!/bin/bash

sqlite3 .tmp/chinook.db "SELECT * from albums" | fzf
