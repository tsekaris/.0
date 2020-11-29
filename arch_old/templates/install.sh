#!/bin/sh

start=`date +%s`

install(){
    # Prepare disk
    DISK="/dev/sda"
    PARTITION="/dev/sda1"
    echo DISK="$DISK", PARTITION="$PARTITION"
    parted -s "$DISK" mklabel msdos
    parted -s -a optimal "$DISK" mkpart primary ext4 0% 100%
    parted -s "$DISK" set 1 boot on
    mkfs.ext4 -F "$PARTITION"
    mount "$PARTITION" /mnt

    # sync time:
    timedatectl set-ntp true

    # To mirrorlist που δημιουργείται αφορά και το νέο σύστημα. 
    mirrors(){
        pacman -Sy pacman-contrib --noconfirm #Για νa γίνει install το rankmirrors. Με -S δεν δουλέυει σε αυτό το σημείο του instalation
        echo "--Ranking mirrors--"
        curl -s "https://www.archlinux.org/mirrorlist/?country=GR&country=DE&protocol=https&use_mirror_status=on" | sed -e 's/^#Server/Server/' -e '/^#/d' | rankmirrors -n 6 - > /etc/pacman.d/mirrorlist
    }
    mirrors
    pacman -Syy 
    pacstrap /mnt base base-devel
    genfstab -U /mnt >> /mnt/etc/fstab
    cp $0 /mnt/install.sh
    arch-chroot /mnt ./install.sh chroot
    # Όταν θα βγει από το chroot με exit θα εκτελεστούν οι παρακάτω εντολές.
    rm /mnt/install.sh
    umount -R /mnt
    reboot
}

configuration(){
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
    echo "password please:"
    read password
    echo -en "$password\n$password" | passwd
    useradd -m -G wheel,users -s /bin/bash tsekaris
    echo -en "$password\n$password" | passwd tsekaris
    # Για να μην ζητάει password.
    echo 'root ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers
    echo '%wheel ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
}

software(){
    # Πρέπει να λειτουργήσει ως tsekaris
    cd ~
    sudo pacman -Syu

    #grub
    sudo pacman -S grub --noconfirm
    sudo grub-install --recheck --target=i386-pc /dev/sda
    sudo grub-mkconfig -o /boot/grub/grub.cfg

    # git
    sudo pacman -S git --noconfirm

    # aur
    aur(){
        mkdir ~/temp
        cd ~/temp
        git clone https://aur.archlinux.org/yay.git
        cd yay
        makepkg -si #--noconfirm 
        rm -rf ~/temp
        cd ~
    }
    #aur

    #coding
    sudo pacman -S nodejs npm --noconfirm
    sudo pacman -S python python2 --noconfirm

    # Με 4 εντολές τα πάντα:
    # Ta server και apps εμπεριέχονται στο xorg. Αυτά δίνει το anarchy.
    sudo pacman -S xorg --noconfirm
    sudo pacman -S xorg-drivers --noconfirm #Όλοι οι drivers για κάρτες γραφικών, πληκτρολόγιο, ποντίκι, touch pads.

    #Hardware
    sudo pacman -S acpi --noconfirm #Για κατάσταση μπαταρίας.

    # Display manager. 
    sudo pacman -S lightdm --noconfirm
    sudo pacman -S lightdm-gtk-greeter --noconfirm
    sudo systemctl enable lightdm.service
    
    # Window manager
    sudo pacman -S i3 --noconfirm
    #sudo pacman -S openbox --noconfirm
    sudo pacman -S polkit-gnome --noconfirm # Authentication problem.
    sudo pacman -S gnome-keyring --noconfirm # Authentication problem.Τα polkit-gnome έχω την αίσθηση ότι κάνει εγκατάσταση πολλά.
    sudo pacman -S xdg-user-dirs --noconfirm #home directions
    sudo pacman -S ttf-dejavu --noconfirm #fonts
    sudo pacman -S compton --noconfirm #fonts
    
    # network
    # netctl και dhpcd είναι στο base
    sudo systemctl enable dhcpcd.service
    sudo pacman -S ifplugd --noconfirm #όταν συνδέεται το καλώδιο.

    #wifi
    sudo pacman -S dialog --noconfirm #wifi menu.
    sudo pacman -S wpa_supplicant --noconfirm #Διαχείριση κωδικών.
    sudo pacman -S wpa_actiond --noconfirm #Αυτόματη είσοδος σε wifi δίκτυα.
    #sudo pacman -S wireless_tools --noconfirm  #anarchy

    # sound
    sudo pacman -S pulseaudio --noconfirm
    sudo pacman -S pulseaudio-alsa --noconfirm
    sudo pacman -S alsa-utils --noconfirm
    sudo pacman -S pavucontrol --noconfirm
    sudo pacman -S pulsemixer --noconfirm
    
    # system
    sudo pacman -S bash-completion --noconfirm #anarchy
    sudo pacman -S cpupower --noconfirm #anarchy
    sudo pacman -S ntp --noconfirm
    sudo systemctl enable ntpd.service
    sudo pacman -S openssh --noconfirm
    sudo systemctl enable sshd.service
    sudo pacman -S tmux --noconfirm
    sudo pacman -S htop --noconfirm
    sudo pacman -S nmap --noconfirm

    # system gui
    sudo pacman -S xterm --noconfirm
    sudo pacman -S lxterminal --noconfirm
    sudo pacman -S rxvt-unicode --noconfirm
    sudo pacman -S lxappearance --noconfirm
    sudo pacman -S arandr --noconfirm
    sudo pacman -S screenfetch --noconfirm
    sudo pacman -S dmenu --noconfirm
    sudo pacman -S rofi --noconfirm
    sudo pacman -S hardinfo --noconfirm

    # files
    sudo pacman -S udiskie --noconfirm 
    sudo pacman -S ranger --noconfirm
    sudo pacman -S trash-cli --noconfirm
    sudo pacman -S stow --noconfirm
    sudo pacman -S rsync --noconfirm
    sudo pacman -S sshfs --noconfirm
    sudo pacman -S ntfs-3g --noconfirm
    sudo pacman -S samba --noconfirm
    sudo pacman -S unzip --noconfirm
    sudo pacman -S gparted --noconfirm

    # files
    sudo pacman -S pcmanfm --noconfirm
    #yay -S dropbox dropbox-cli #--noconfirm

    # office
    #sudo pacman -S vim --noconfirm
    sudo pacman -S imagemagick --noconfirm
    sudo pacman -S pandoc --noconfirm
    sudo pacman -S bc --noconfirm

    # office gui
    sudo pacman -S gvim --noconfirm
    sudo pacman -S geany --noconfirm
    sudo pacman -S leafpad --noconfirm
    sudo pacman -S gimp --noconfirm
    sudo pacman -S inkscape --noconfirm
    sudo pacman -S libreoffice-still --noconfirm
    sudo pacman -S zathura zathura-pdf-mupdf --noconfirm

    # internet
    sudo pacman -S lynx --noconfirm
    sudo pacman -S w3m --noconfirm
    sudo pacman -S curl --noconfirm
    sudo pacman -S transmission-cli --noconfirm
    sudo pacman -S wget --noconfirm

    # internet gui
    sudo pacman -S chromium --noconfirm
    #sudo pacman -S firefox #--noconfirm
    #yay -S google-chrome #--noconfirm

    # multimedia
    sudo pacman -S cmus --noconfirm

    # multimedia gui
    sudo pacman -S feh --noconfirm
    sudo pacman -S gpicview --noconfirm
    sudo pacman -S sxiv --noconfirm
    #sudo pacman -S vlc #--noconfirm
    sudo pacman -S mpv --noconfirm
    sudo pacman -S kodi --noconfirm
    sudo pacman -S libdvdread libdvdcss libdvdnav --noconfirm #dvd play

    #virtualization
    #yay -S vmware-workstation #--noconfirm

    # dot files
    dot_files(){
        cd ~
        wget --recursive --reject "index.html*" --no-parent "192.168.1.13:8080/dotfiles/"
        mv ~/192.168.1.13:8080/dotfiles ~/dotfiles
        rm -r ~/192.168.1.13:8080/
        cd ~/dotfiles
        # to_do: Δεν λειτουργεί ίσως γιατί το σύστημα δημιουργεί ξανά το .bash_profile:
        #stow bash
        stow i3
        stow lxterminal
        #stow xinit
        #stow Xresources
    }
    dot_files
}

echo "-------------------------------"
if [ "$1" == "chroot" ]
then
    # install software
    configuration

    export -f software
    su tsekaris -c "bash -c software"

    # Επαναφορά του password
    sed -i '$d' /etc/sudoers
    sed -i '$d' /etc/sudoers
    echo 'root ALL=(ALL) ALL' > /etc/sudoers
    echo '%wheel ALL=(ALL) ALL' >> /etc/sudoers
else
    install
fi

end=`date +%s`
echo "Execute time:"
echo $((end-start))
echo "secs"
read pause
