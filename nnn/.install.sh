#!/bin/sh

pkg install nnn -y
mkdir -p $HOME/.config/nnn/
cd $HOME/.0/nnn
stow --target=$HOME .dotfiles
