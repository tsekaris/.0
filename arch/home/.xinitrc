#!/bin/sh

# Αλλαγή γλώσσας.
#setxkbmap -layout us,el -option 'grp:alt_shift_toggle'
setxkbmap -layout us,el -option 'grp:caps_toggle' # Πειραματικά η γλώσσα να αλλάζει από το caps locks

# Authentication problem.
/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 & eval $(gnome-keyring-daemon -s --components=pkcs11,secrets,ssh,gpg)

# Φόρτωση των χαρακτιριστικών του urxvt. 
xrdb ~/.Xresources

exec i3
