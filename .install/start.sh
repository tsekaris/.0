#!/bin/sh

pkg upgrade -y
termux-setup-storage # Για να βλέπω τους φακέλους του κινητού

# system.
pkg install git -y
pkg install stow -y
pkg install curl -y
pkg install tmux -y
pkg install htop -y

# ssh server
pkg install openssh -y

# vpn
pkg install wireguard-tools -y

# data
pkg install syncthing -y

# File manager.
pkg install ranger -y
pkg install nnn -y

# Text editor.
pkg install vim-python -y
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim

# Coding.
pkg install nodejs -y
# npm install -g --unsafe-perm node-red # Βγάζει λάθη

# Server and mqtt.
pkg install mosquitto -y

## Media.
pkg install mpv -y # Για radio.

#pkg install zsh -y
#bash -c "$(curl -fsSL https://git.io/oh-my-termux)"

stow --target=$HOME vim
vim +PluginInstall +qall

stow --target=$HOME termux