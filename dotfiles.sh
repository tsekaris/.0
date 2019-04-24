#!/bin/sh

stow --target=$HOME bash
stow --target=$HOME vim
vim +PluginInstall +qall

stow --target=$HOME termux


