#!/bin/bash

for script in $HOME/.0/*/.install.sh
do
    bash "$script"
done
