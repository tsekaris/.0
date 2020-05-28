#!/bin/bash

path=$(dirname $(realpath -s $0))

[ ! -d $HOME/.vim ] && mkdir $HOME/.vim
[ ! -f $HOME/.vim/coc-settings.json ] && ln -s $path/.home/.vim/coc-settings.json $HOME/.vim/coc-settings.json
[ ! -f $HOME/.vimrc ] && ln -s $path/.home/.vimrc $HOME/.vimrc

vim +PlugInstall +qall
