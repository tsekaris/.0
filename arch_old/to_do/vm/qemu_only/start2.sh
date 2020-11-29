#!/bin/sh

export QEMU_AUDIO_DRV=alsa
DISKIMG=~/vm/win10.img
WINIMG=~/vm/Win10_1809Oct_English_x64.iso
VIRTIMG=~/vm/virtio-win-0.1.160.iso
qemu-system-x86_64 --enable-kvm -drive file=${DISKIMG},if=virtio -m 8192 \
-net nic,model=virtio -net user -cdrom ${WINIMG} \
-drive file=${VIRTIMG},index=3,media=cdrom \
-rtc base=localtime,clock=host -smp sockets=1,cores=4,threads=2 \
-usb -device usb-tablet -soundhw ac97 -cpu host -vga std

# Προσοχή πρέπει να γίνει activation τα windows για να δεχτεί όλα τα cores.
#-usb -device usb-tablet -soundhw ac97 -cpu host -vga vmware
