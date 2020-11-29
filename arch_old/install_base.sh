#!/bin/sh

lsblk
echo "Select disk (sdX):"
read DISK
echo "User name:"
read USER
echo "Password:"
read PASSWORD

# Prepare disk
DISK="/dev/${DISK}"

dd if=/dev/zero of="$DISK" bs=1k count=2048 #zero disk
sgdisk -z "$DISK" # zap anything existing (should be nothing after the dd command above)
sgdisk -o "$DISK" # write a new GPT partition with protective MBR
#Make a 10MB MBR partition starting in the beginning of the device's memory
sgdisk -n 1:0:10M "$DISK" 
sgdisk -t 1:ef02 "$DISK"
#Create a 500MB ESP partition
sgdisk -n 2:0:500M "$DISK"
sgdisk -t 2:ef00 "$DISK"
#allocate the remaining space to the Linux partition
sgdisk -n 3:0:0 "$DISK"
sgdisk -t 3:8300 "$DISK"
#Format the 500MB EFI system partition with a FAT32 filesystem:
mkfs.fat -F32 ${DISK}2
#Format the Linux partition with an ext4 filesystem:
mkfs.ext4 ${DISK}3

#Mount the ext4 formatted partition as the root filesystem:
mount ${DISK}3 /mnt
#Mount the FAT32 formatted ESP partition to /mnt/boot:
mkdir /mnt/boot
mount ${DISK}2 /mnt/boot

#mount "$PARTITION" /mnt

# sync time:
timedatectl set-ntp true

# To mirrorlist που δημιουργείται αφορά και το νέο σύστημα. 
pacman -Sy pacman-contrib --noconfirm #Για νa γίνει install το rankmirrors. Με -S δεν δουλέυει σε αυτό το σημείο του instalation
echo "--Ranking mirrors--"
curl -s "https://www.archlinux.org/mirrorlist/?country=GR&country=DE&protocol=https&use_mirror_status=on" | sed -e 's/^#Server/Server/' -e '/^#/d' | rankmirrors -n 6 - > /etc/pacman.d/mirrorlist

pacman -Syy 
pacstrap /mnt base base-devel
genfstab -U /mnt >> /mnt/etc/fstab

chroot_actions(){
    
    #swap file
    size=2G # G or M
    fallocate -l "$size" /swapfile
    #dd if=/dev/zero of=/swapfile bs=1M count=512 #slow but stable
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile	swap	swap	defaults	0	0" >> /etc/fstab

    # locale
    echo 'LANG="en_US.UTF-8"' >> /etc/locale.conf
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
    echo "el_GR.UTF-8 UTF-8" >> /etc/locale.gen
    locale-gen
    ln -sf /usr/share/zoneinfo/Europe/Athens /etc/localtime
    hwclock --systohc

    # hosts
    hostname=tsekArch
    echo $hostname > /etc/hostname
    echo "127.0.0.1 localhost.localdomain localhost" > /etc/hosts
    echo "::1       localhost.localdomain localhost" >> /etc/hosts
    echo "127.0.1.1 $hostname.localdomain $hostname" >> /etc/hosts

    # users
    user="$1"
    password="$2"
    echo -en "$password\n$password" | passwd
    useradd -m -G wheel,users -s /bin/bash "$user"
    echo -en "$password\n$password" | passwd "$user"
    echo 'root ALL=(ALL) ALL' > /etc/sudoers
    echo '%wheel ALL=(ALL) ALL' >> /etc/sudoers
    ## Για να μην ζητάει συνέχεια password στο sudo.
    echo "$user ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$user 
    chmod 0440 /etc/sudoers.d/$user

    # grub
    disk="$3"
    pacman -S grub efibootmgr --noconfirm
    grub-install --target=i386-pc --boot-directory /boot "$disk"
    grub-install --target=x86_64-efi --efi-directory /boot --boot-directory /boot --removable
    grub-mkconfig -o /boot/grub/grub.cfg

    # system
    pacman -S ntp --noconfirm
    systemctl enable ntpd.service
    pacman -S openssh --noconfirm
    systemctl enable sshd.service

    # network
    systemctl enable dhcpcd.service
}

export -f chroot_actions
arch-chroot /mnt /bin/bash -c "chroot_actions $USER $PASSWORD $DISK"

umount -R /mnt
reboot
