#!/bin/sh

cd .dotfiles
stow --target=$HOME vim
stow --target=$HOME termux

