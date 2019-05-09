#!/bin/sh

pkg upgrade -y
termux-setup-storage # Για να βλέπω τους φακέλους του κινητού

# system.
pkg install git -y
pkg install stow -y
pkg install curl -y
pkg install tmux -y
pkg install htop -y
pkg install man -y

# ssh server
pkg install openssh -y

# text editor
pkg install nano -y

# vpn
pkg install wireguard-tools -y

# data
pkg install syncthing -y

# Files managment.
pkg install ranger -y
pkg install nnn -y
pkg install fzf -y

# Coding.
pkg install nodejs -y
# npm install -g --unsafe-perm node-red # Βγάζει λάθη

# Server and mqtt.
pkg install mosquitto -y

## Media.
pkg install mpv -y # Για radio.

# install dotfiles
sh $HOME/scripts/system/dotfiles.sh


# Vim.
#pkg install vim-python -y
#git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
#vim +PluginInstall +qall

#pkg install zsh -y
#bash -c "$(curl -fsSL https://git.io/oh-my-termux)"
