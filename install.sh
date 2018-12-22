#!/bin/sh

pkg upgrade
termux-setup-storage
pkg install git
pkg install stow
pkg install ranger
pkg install curl

pkg install vim 
pkg install vim-python
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
stow --target=$HOME vim
vim +PluginInstall +qall

pkg install zsh
bash -c "$(curl -fsSL https://git.io/oh-my-termux)"
