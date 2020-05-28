#!/bin/bash

touch  ~/.bashrc #Αν υπάρχει δεν το σβήνει.
text="source $(dirname $(realpath -s $0))/.home/.bashrc"
[[ -z $(rg "$text" ~/.bashrc) ]] && echo "$text" >> ~/.bashrc
