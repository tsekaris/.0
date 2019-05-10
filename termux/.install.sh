#!/bin/sh

pkg upgrade -y
termux-setup-storage # Για να βλέπω τους φακέλους του κινητού
ln -s $HOME/storage/shared/0 $HOME/0 # Συντόμευση του 0 στο home 
stow --target=$HOME $HOME/.0/termux/.dotfiles
