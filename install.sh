#!/bin/sh

pkg upgrade
termux-setup-storage
pkg install git
pkg install stow
pkg install ranger

pkg install vim
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
stow --target=$HOME vim
vim +PluginInstall +qall
