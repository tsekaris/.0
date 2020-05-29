#!/bin/bash

path=$(dirname $(realpath -s $0))

[ ! -d $HOME/.vim ] && mkdir $HOME/.vim
ln -sfn $path/.home/.vim/coc-settings.json $HOME/.vim/coc-settings.json
ln -sfn $path/.home/.vimrc $HOME/.vimrc

vim +PlugInstall +qall
