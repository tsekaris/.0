#!/bin/bash

# vmwware
sudo pacman -S linux-headers --noconfirm
yay -S vmware-workstation15 --noconfirm
sudo systemctl enable vmware-networks.service
sudo systemctl enable vmware-usbarbitrator.service
sudo modprobe -a vmw_vmci vmmon

