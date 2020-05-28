#!/bin/bash

for script in $HOME/.0/*/install.sh
do
  bash "$script"
done

for script in $HOME/.0/*/dot_files.sh
do
  bash "$script"
done
