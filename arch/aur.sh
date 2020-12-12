#!/bin/bash

#Δεν μπορώ να τα λειτουργήσω στο install.sh

# yay
sudo pacman -S git base-devel --noconfirm
cd ~
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si --noconfirm

