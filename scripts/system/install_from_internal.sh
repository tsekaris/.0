#!/bin/sh

termux-setup-storage
ln -s $HOME/storage/shared/0 $HOME/0
ln -s $HOME/storage/shared/0/computing/termux $HOME/.0
sh .0/scripts/system/install.sh
