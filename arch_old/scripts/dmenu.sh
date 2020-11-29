#!/bin/sh

# sources:
# https://wiki.archlinux.org/index.php/dmenu
# http://akuederle.com/awesome-dmenu
# https://www.youtube.com/watch?v=R9m723tAurA

# Για το dmenu:
# -i Αγνοεί κεφαλαία μικρά
# -p Μήνυμα

fn01(){
    source ~/.alias # Απαραίτητο 
    menu=("facebook\ntwitter\nyoutube\nsheet\nbattery") # Λειτουργεί χωρίς τις παρενθέσεις.
    pc $(echo -e $menu | dmenu -i -p "pc")
}

fn02(){
    # battery=$(acpi)
    # echo -e "ok"| dmenu -i -p "$battery"
    # Το παραπάνω με μία εντολή:
    echo -e "ok"| dmenu -i -p "$(acpi)"
}

fn03(){
    [ $(echo -e "No\nYes" | dmenu -i -p "run") == "Yes" ] && urxvt -e sh ~/.chuwi_wifi.sh 
}

fn04(){
    source ~/.alias # Απαραίτητο 
    pc $(cat /home/tsekaris/.0/scripts/menu.txt | dmenu -i -p "pc") 
}

#fn01
#fn02
#fn03
fn04

