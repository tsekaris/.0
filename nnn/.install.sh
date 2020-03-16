#!/bin/sh

pkg install nnn -y
cd $HOME/.0/nnn
stow --target=$HOME .dotfiles
