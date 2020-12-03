#!/bin/bash

#Δεν μπορώ να τα λειτουργήσω στο install.sh

# yay
sudo pacman -S git base-devel --noconfirm
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si --noconfirm

# vmwware
sudo pacman -S linux-headers --noconfirm
yay -S vmwware-workstation15 --noconfirm
systemctl enable vmware-networks.service
systemctl enable vmware-usbarbitrator.service
modprobe -a vmw_vmci vmmon

