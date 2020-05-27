#!/bin/sh

pkg install nnn -y

#bashrc
touch ~/.bashrc #Αν υπάρχει δεν το σβήνει.
text="source $(dirname $(realpath -s $0))/.bashrc"
[[ -z $(rg "$text" ~/.bashrc) ]] && echo "$text" >> ~/.bashrc

#dotfiles plugins:
mkdir -p $HOME/.config/nnn/
cd $HOME/.0/nnn
stow --target=$HOME .dotfiles
