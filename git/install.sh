#!/bin/bash

pkg install git -y

git config --global credential.helper cache
# Set git to use the credential memory cache

git config --global credential.helper 'cache --timeout=86400'
# Set the cache to timeout after 24 hours (setting is in seconds)

git config --global user.name "tsekaris"
git config --global user.email "tsemix@gmail.com"

# Global .gitignore
git config --global core.excludesfile ~/.0/git/global_gitignore
