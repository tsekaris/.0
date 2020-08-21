#!/bin/bash

cd $(dirname "$0")
mkdir .tmp
cd .tmp

pouchdb-server --port 3000 --host 0.0.0.0

# --host 0.0.0.0
# Μπορεί να αλλάξει μέσω web server αλλά από το κινητό (default: 127.0.0.1)

# --in-memory 
# Στην μνήμη
