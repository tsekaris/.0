#!/bin/bash

lsblk
echo "Select disk (sdX):"
read DISK
echo "User name:"
read USER
echo "Password:"
read -s PASSWORD

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
pacstrap /mnt base base-devel linux linux-firmware
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

    # coding
    pacman -S git --noconfirm
    pacman -S nodejs-lts-fermium npm --noconfirm
    pacman -S python python2 --noconfirm

    # xorg - hardware
    pacman -S xorg --noconfirm
    pacman -S xorg-xinit --noconfirm
    pacman -S xorg-drivers --noconfirm #Όλοι οι drivers για κάρτες γραφικών, πληκτρολόγιο, ποντίκι, touch pads.
    pacman -S acpi --noconfirm #Για κατάσταση μπαταρίας.
    # Graphic drivers 
    # Απο arch wiki για install σε usb.ε
    pacman -S xf86-video-vesa --noconfirm
    pacman -S xf86-video-ati --noconfirm
    pacman -S xf86-video-intel --noconfirm
    pacman -S xf86-video-amdgpu --noconfirm
    pacman -S xf86-video-nouveau --noconfirm
    pacman -S xf86-video-fbdev --noconfirm

    #  UI
    pacman -S i3-wm --noconfirm
    pacman -S i3status --noconfirm
    #pacman -S i3blocks --noconfirm
    #pacman -S i3lock --noconfirm
    pacman -S polkit-gnome --noconfirm # Authentication problem.
    pacman -S gnome-keyring --noconfirm # Authentication problem.Τα polkit-gnome έχω την αίσθηση ότι κάνει εγκατάσταση πολλά.
    pacman -S xdg-user-dirs --noconfirm #home directions
    pacman -S dmenu --noconfirm

    # system
    pacman -S rxvt-unicode --noconfirm
    pacman -S urxvt-perls --noconfirm
    systemctl enable systemd-timesyncd.service
    pacman -S openssh --noconfirm
    systemctl enable sshd.service
    pacman -S tmux --noconfirm
    pacman -S stow --noconfirm
    pacman -S ripgrep --noconfirm
    pacman -S fd --noconfirm

    # system view
    pacman -S htop --noconfirm
    pacman -S hwinfo --noconfirm 
    pacman -S screenfetch --noconfirm

    # network
    # Απεμπλοκή από τον network manager:
    # Βαρύ πρόγραμμα. Πολλά χωρίς να γίνεται χρήση τους.
    # Πρόβλημα με τα ονόματα των wifi adapters στα διαφορετικά pc
    # systemd  και iwd πλέον
    # Χρειάζονται να φτιάξω κάποια script και να εμβαθύνω.
    # Αν είναι wifi off εκτέλεση sudo rfkil unblock all
    ## sysetmd-networkd
    systemctl enable systemd-networkd.service
    systemctl enable systemd-resolved.service # απαραίτητο και για το iwd

    echo '[Match]' > /etc/systemd/network/10-wired.network
    echo 'Name=en*' >> /etc/systemd/network/10-wired.network
    echo '' >> /etc/systemd/network/10-wired.network
    echo '[Network]' >> /etc/systemd/network/10-wired.network
    echo 'DHCP=yes' >> /etc/systemd/network/10-wired.network

    echo '[Match]' > /etc/systemd/network/20-wireless.network
    echo 'Name=w*' >> /etc/systemd/network/20-wireless.network
    echo '' >> /etc/systemd/network/20-wireless.network
    echo '[Network]' >> /etc/systemd/network/20-wireless.network
    echo 'DHCP=yes' >> /etc/systemd/network/20-wireless.network
    ## wifi
    pacman -S iwd --noconfirm  # έχει και αυτό dchp client  και  διαχείριση static ip αλλά δεν το χρησιμοποιούμε. 
    systemctl enable iwd.service
    
    # sound
    pacman -S pulseaudio --noconfirm
    pacman -S pulseaudio-alsa --noconfirm
    pacman -S pulsemixer --noconfirm

    # display
    pacman -S arandr --noconfirm #gui. Μπορεί να εγκατασταθεί άνετα από scripts.

    # files
    pacman -S nnn --noconfirm 
    # pacman -S pcmanfm --noconfirm
    pacman -S udiskie --noconfirm #mount external disks
    pacman -S trash-cli --noconfirm
    pacman -S rsync --noconfirm
    pacman -S sshfs --noconfirm
    pacman -S ntfs-3g --noconfirm
    pacman -S parted --noconfirm

    # office
    pacman -S vim --noconfirm
    # pacman -S inkscape --noconfirm
    # pacman -S libreoffice-still --noconfirm
    pacman -S zathura zathura-pdf-mupdf --noconfirm

    # internet
    pacman -S curl --noconfirm
    pacman -S wget --noconfirm
    pacman -S chromium --noconfirm
    pacman -S ttf-dejavu --noconfirm #Απαραίτητο για να εμφανιστούν τα σύμβολα. Αλλάζει και τα fonts στον chromium. Περιέχεται και στο inkscape

    # multimedia
    pacman -S sxiv --noconfirm
    pacman -S mpv --noconfirm
    pacman -S libdvdcss --noconfirm #dvd play

    # fish
    # Δεν μπορεί να αντικαταστήσει το bash. Αρκετές ασυμβατότητες.
    # Θα το δω σαν γλώσσα προγραμματισμού.
    pacman -S fish --noconfirm

    user_actions(){
        cd $HOME
        git clone https://github.com/tsekaris/.0.git ~/.0

        # dotfiles
        cd $HOME/.0/arch/
        stow -t $HOME --no-folding home

        # bashrc
        touch  ~/.bashrc #Αν υπάρχει δεν το σβήνει.
        text='for f in ~/.config/bash/*;source $f;done'
        [[ -z $(rg "$text" ~/.bashrc) ]] && echo "$text" >> ~/.bashrc

        curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
        # vim +PlugInstall +qall # Βγάζει σφάλμα όταν γίνεται install.
    }
    export -f user_actions
    su "$user" -c "bash -c user_actions"
}

export -f chroot_actions
arch-chroot /mnt /bin/bash -c "chroot_actions $USER $PASSWORD $DISK"

umount -R /mnt
reboot
