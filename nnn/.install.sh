#!/bin/sh

pkg install nnn -y

#bashrc
touch ~/.bashrc #Αν υπάρχει δεν το σβήνει.
text="source $(dirname $(realpath -s $0))/.bashrc"
[[ -z $(rg "$text" ~/.bashrc) ]] && echo "$text" >> ~/.bashrc

#dotfiles plugins:
[ ! -d $HOME/.config/nnn ] && mkdir -p $HOME/.config/nnn/
[ ! -d $HOME/.config/nnn/plugins ] && ln -s $HOME/.0/nnn/plugins $HOME/.config/nnn/plugins
