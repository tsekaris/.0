#!/bin/sh

git config --global credential.helper cache
# Set git to use the credential memory cache

git config --global credential.helper 'cache --timeout=86400'
# Set the cache to timeout after 24 hours (setting is in seconds)

git config user.name "tsekaris"
git config user.email "tsemix@gmail.com"
read -p "Press enter." dummy
