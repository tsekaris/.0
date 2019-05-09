#!/bin/sh

# Για να γίνει εγκατάσταση με ένα script
pkg install git -y
git clone https://github.com/tsekaris/termux.git ~/.0
sh ~/.0/scripts/install.sh
