#!/bin/sh

stow --target=$HOME --dir=.dotfiles/vim 
vim +PluginInstall +qall

stow --target=$HOME --dir=dotfiles/termux 
