#!/bin/sh

# pkg install vim-python -y # Για να δουλεύει με τα plugins που εξαρτιόνται από python. Βγάζει θέματα σε updates.
pkg install vim -y
pkg install vim-python -y #Κάνει uninstall το vim. Κατά περιόδους κρασάρει σε install ή update.

curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
 
[ ! -d $HOME/.vim ] && mkdir $HOME/.vim 
[ ! -f $HOME/.vim/coc-settings.json ] && ln -s $HOME/.0/vim/coc-settings.json $HOME/.vim/coc-settings.json
[ ! -f $HOME/.vimrc ] && ln -s $HOME/.0/vim/.vimrc $HOME/.vimrc
vim +PlugInstall +qall
