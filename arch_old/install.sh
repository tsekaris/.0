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

    # coding
    pacman -S git --noconfirm
    pacman -S nodejs npm --noconfirm
    pacman -S python python2 --noconfirm

    # xorg - hardware
    pacman -S xorg --noconfirm
    pacman -S xorg-xinit --noconfirm
    pacman -S xorg-drivers --noconfirm #Όλοι οι drivers για κάρτες γραφικών, πληκτρολόγιο, ποντίκι, touch pads.
    pacman -S acpi --noconfirm #Για κατάσταση μπαταρίας.

    #  UI
    pacman -S i3-wm --noconfirm
    pacman -S i3status --noconfirm
    #pacman -S i3blocks --noconfirm
    #pacman -S i3lock --noconfirm
    pacman -S polkit-gnome --noconfirm # Authentication problem.
    pacman -S gnome-keyring --noconfirm # Authentication problem.Τα polkit-gnome έχω την αίσθηση ότι κάνει εγκατάσταση πολλά.
    pacman -S xdg-user-dirs --noconfirm #home directions
    pacman -S dmenu --noconfirm
    pacman -S rofi --noconfirm

    # system
    pacman -S rxvt-unicode --noconfirm
    pacman -S urxvt-perls --noconfirm
    #pacman -S xterm --noconfirm
    #pacman -S bash-completion --noconfirm #anarchy
    #pacman -S cpupower --noconfirm #anarchy
    pacman -S ntp --noconfirm
    systemctl enable ntpd.service
    pacman -S openssh --noconfirm
    systemctl enable sshd.service
    pacman -S tmux --noconfirm

    # system view
    pacman -S htop --noconfirm
    pacman -S hwinfo --noconfirm 
    pacman -S screenfetch --noconfirm
    #pacman -S hardinfo --noconfirm #gui. Πολύ δυνατό. Μακάρι να το αντικαταστήσουμε με scripts

    # network
    systemctl enable dhcpcd.service
    pacman -S dialog --noconfirm #wifi menu.
    pacman -S wpa_supplicant --noconfirm #Διαχείριση κωδικών.
    pacman -S wpa_actiond --noconfirm #Αυτόματη είσοδος σε wifi δίκτυα.
    pacman -S wireless_tools --noconfirm  #anarchy
    #pacman -S nmap --noconfirm #use first

    # sound
    pacman -S pulseaudio --noconfirm
    pacman -S pulseaudio-alsa --noconfirm
    #pacman -S alsa-utils --noconfirm
    pacman -S pulsemixer --noconfirm

    # display
    #pacman -S arandr --noconfirm #gui. Μπορεί να εγκατασταθεί άνετα από scripts.
    #pacman -S lxrandr --noconfirm
    #pacman -S autorandr --noconfirm #script για auto configuration των display

    # files - ranger
    pacman -S ranger --noconfirm 
    pacman -S atool --noconfirm #ranger optional
    pacman -S p7zip --noconfirm #atool optional
    pacman -S tar --noconfirm #atool optional
    pacman -S unrar --noconfirm #atool optional
    pacman -S unzip --noconfirm #atool optional
    pacman -S zip --noconfirm #atool optional
    #pacman -S ffmpegthumbnailer --noconfirm #ranger optional. video preview.
    pacman -S highlight --noconfirm #ranger optional. syntax highlighting. qt-base.
    #pacman -S lynx --noconfirm #ranger optional. browser.
    pacman -S w3m --noconfirm #ranger optional. browser. image preview.
    #pacman -S poppler --noconfirm #ranger optional. pdf preview. qt5-base.
    pacman -S transmission-cli --noconfirm #ranger optional. bitTorrent client. qt5-base.
    pacman -S udiskie --noconfirm #mount external disks
    pacman -S trash-cli --noconfirm
    pacman -S rsync --noconfirm
    pacman -S sshfs --noconfirm
    pacman -S ntfs-3g --noconfirm
    #pacman -S samba --noconfirm
    #pacman -S gparted --noconfirm #we dont need gui
    pacman -S parted --noconfirm
    #pacman -S pcmanfm --noconfirm #Δεν πιάνει χώρο αλλά να χρησιμοποιούμε μόνο τον ranger

    # office
    pacman -S vim --noconfirm
    vim_plugins(){
        pacman -S vim-nerdtree --noconfirm
        pacman -S vim-ale --noconfirm
        pacman -S vim-fugitive --noconfirm
        pacman -S vim-ultisnips --noconfirm
    }
    vim_plugins # Μάλλον πρέπει να γίνεται μέσω vundle.
    #pacman -S leafpad --noconfirm
    #pacman -S imagemagick --noconfirm
    #pacman -S pandoc --noconfirm # too big
    #pacman -S inkscape --noconfirm
    #pacman -S gimp --noconfirm # first use it
    #pacman -S libreoffice-fresh --noconfirm
    #pacman -S gnumeric --noconfirm
    #pacman -S llpp --noconfirm #for testing 37mb
    pacman -S zathura zathura-pdf-mupdf --noconfirm

    # internet
    pacman -S curl --noconfirm
    pacman -S wget --noconfirm
    pacman -S chromium --noconfirm
    #pacman -S firefox --noconfirm 

    # multimedia
    pacman -S feh --noconfirm
    pacman -S sxiv --noconfirm
    #pacman -S cmus --noconfirm # Το έκανα χρήση για να ακούω ράδιο. Πλέον εύκολα γίνεται μέσω mpv
    pacman -S mpv --noconfirm
    pacman -S libdvdcss --noconfirm #dvd play

    # dotfiles
    pacman -S stow --noconfirm

    # zsh
    pacman -S zsh --noconfirm
    chsh -s /bin/zsh root
    chsh -s /bin/zsh $USER
    pacman -S ttf-dejavu --noconfirm #Απαραίτητο για να εμφανιστούν τα σύμβολα. Αλλάζει και τα fonts στον chromium. Περιέχεται και στο inkscape
    pacman -S zsh-autosuggestions --noconfirm 
    pacman -S zsh-history-substring-search --noconfirm 
    pacman -S zsh-syntax-highlighting --noconfirm 
    #pacman -S zsh-completions --noconfirm # Δεν ξέρω πως να το χρησιμοποιήσω


    user_actions(){
        cd ~
        git clone https://github.com/tsekaris/0.git ~/.0
        #dotfiles
        rm ~/.bashrc
        rm ~/.xinitrc
        cd ~/.0/dotfiles
        stow --target=$HOME i3
        stow --target=$HOME xinit
        stow --target=$HOME Xresources
        stow --target=$HOME ranger
        stow --target=$HOME bash
        stow --target=$HOME zsh
        stow --target=$HOME alias
        stow --target=$HOME vim
        stow --target=$HOME feh
        # oh-my-zsh
        #git clone https://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh
        #cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
        vim_vundle(){
            #vim plugins with vundle
            git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
            vim +PluginInstall +qall
        }
        #vim_vundle
    }
    export -f user_actions
    su "$user" -c "bash -c user_actions"
}

export -f chroot_actions
arch-chroot /mnt /bin/bash -c "chroot_actions $USER $PASSWORD $DISK"

umount -R /mnt
reboot
