#!/bin/sh

termux-setup-storage # Για να βλέπω τους φακέλους του κινητού
ln -s $HOME/storage/shared/0 $HOME/0 # Συντόμευση του 0 στο home
mkdir $HOME/.0/.tmp
cd $HOME/.0/termux
stow --target=$HOME .dotfiles
