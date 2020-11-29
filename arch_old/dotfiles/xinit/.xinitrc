#!/bin/sh

defaults(){
    # Τα παρακάτω είναι από /etc/X11/xinit/xinitrc

    userresources=$HOME/.Xresources
    usermodmap=$HOME/.Xmodmap
    sysresources=/etc/X11/xinit/.Xresources
    sysmodmap=/etc/X11/xinit/.Xmodmap

    # merge in defaults and keymaps

    if [ -f $sysresources ]; then
        xrdb -merge $sysresources
    fi

    if [ -f $sysmodmap ]; then
        xmodmap $sysmodmap
    fi

    if [ -f "$userresources" ]; then
        xrdb -merge "$userresources"
    fi

    if [ -f "$usermodmap" ]; then
        xmodmap "$usermodmap"
    fi

    # start some nice programs

    if [ -d /etc/X11/xinit/xinitrc.d ] ; then
     for f in /etc/X11/xinit/xinitrc.d/?*.sh ; do
      [ -x "$f" ] && . "$f"
     done
     unset f
    fi
}

#defaults #Βγάλε # αν θες να εκτελεστούν τα παραπάνω.

# anarchy linux. Μόνο αυτό έχει σε αντίθεση με το arch wiki που λέει να κάνει copy το default

# Αλλαγή γλώσσας.
#setxkbmap -layout us,el -option 'grp:alt_shift_toggle'
setxkbmap -layout us,el -option 'grp:caps_toggle' # Πειραματικά η γλώσσα να αλλάζει από το caps locks

# Authentication problem.
/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 & eval $(gnome-keyring-daemon -s --components=pkcs11,secrets,ssh,gpg)

# Φόρτωση των χαρακτιριστικών του urxvt. 
xrdb ~/.Xresources

# wallpaper με feh
~/.fehbg &

# i3
exec i3
#exec dwm
