#!/bin/sh

pkg install nnn -y
mkdir -p $HOME/.config/nnn/plugins
cd $HOME/.0/nnn
stow --target=$HOME .dotfiles
