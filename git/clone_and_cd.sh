#!/bin/bash

echo "Github link:"
read link
git clone $link && cd $(basename $link .git) 
