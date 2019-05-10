#!/bin/sh

install(){
	sh $HOME/.0/$1/.install.sh
}

pkg upgrade -y
install git # Θα έχει ήδη εγκαταστηθεί αν πρέπει να κάνουμε git clone.
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
install termux
install tmux
install vim
install vpn
