#!/bin/sh

install(){
	sh $1/.install.sh
}

install termux
install git
install stow
# Τα παραπάνω έχουν σημασία να εγκατασταθούν πρώτα.

install bash
install fzf
install htop
install mosquitto
install mpv
install nnn
install nodejs
install ranger
install rclone
install rsync
install ssh
install syncthing
install tmux
install vim
install vpn
