#!/bin/sh

# pkg install vim-python -y # Για να δουλεύει με τα plugins που εξαρτιόνται από python. Βγάζει θέματα σε updates.
pkg install vim -y
pkg install vim-python -y #Κάνει uninstall το vim. Κατά περιόδους κρασάρει σε install ή update.
cd $HOME/.0/vim
stow --target=$HOME .dotfiles
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
vim +PluginInstall +qall
