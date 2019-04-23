#!/bin/sh

stow --target=$HOME .dotfiles #keyboard
vim +PluginInstall +qall
