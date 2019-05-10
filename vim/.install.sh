#!/bin/sh

# pkg install vim-python -y # Για να δουλεύει με τα plugins που εξαρτιόνται από python. Βγάζει θέματα σε updates.
pkg install vim -y
stow --target=$HOME .dotfiles
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
vim +PluginInstall +qall
