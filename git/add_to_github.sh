#!/bin/sh

echo "Github link:"
read link
git remote add origin $link # Sets the new remote
git remote -v # Verifies the new remote URL
