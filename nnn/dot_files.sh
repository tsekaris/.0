#!/bin/bash

#bashrc
touch  ~/.bashrc #Αν υπάρχει δεν το σβήνει.
path=$(dirname $(realpath -s $0))
text="source $path/.home/.bashrc"
[[ -z $(rg "$text" ~/.bashrc) ]] && echo "$text" >> ~/.bashrc

#plugins:
[ ! -d $HOME/.config/nnn ] && mkdir -p $HOME/.config/nnn/
[ ! -d $HOME/.config/nnn/plugins ] && ln -s $path/.home//.config/nnn/plugins $HOME/.config/nnn/plugins
