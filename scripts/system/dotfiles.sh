#!/bin/sh

cd $HOME/.0/dotfiles

stow --target=$HOME bash
stow --target=$HOME termux
stow --target=$HOME vim
