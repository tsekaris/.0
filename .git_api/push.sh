#!/bin/sh

cd ..
echo "Comment:"
read comment
git add .
git commit -m "$comment"
git push
