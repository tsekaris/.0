#!/bin/sh

sudo pacman -S ovmf

# Δεν δουλεύει λόγω δικαιωμάτων. Στο γενικό install θα δουλέψει:
sudo echo 'nvram = ["/usr/share/ovmf/x64/OVMF_CODE.fd:/usr/share/ovmf/x64/OVMF_VARS.fd"]' >> /etc/libvirt/qemu.conf

#Στο virt-manager επιλέγουμε q35 και uefi


