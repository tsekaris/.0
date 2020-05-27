#!/bin/sh

pkg install fzf -y

touch ~/.bashrc #Αν υπάρχει δεν το σβήνει.
text="source $(dirname $(realpath -s $0))/.bashrc"
[[ -z $(rg "$text" ~/.bashrc) ]] && echo "$text" >> ~/.bashrc
