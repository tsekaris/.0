#!/bin/sh

stow --target=$HOME .dotfiles/vim 
stow --target=$HOME .dotfiles/termux 
vim +PluginInstall +qall
