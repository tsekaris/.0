#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

if [[ "$(tty)" == '/dev/tty1' ]]; then
    exec startx
fi

# Preventing nested nnn instances
nnn() {
    if [ -z "$NNNLVL" ]; then
        /usr/bin/nnn "$@"
    else
        exit
    fi
}

# Ποιο γρήγορο shortcut
n(){
    nnn -H 
}
#Δεν λειτουργεί στο termux γιατί δεν υπάρχει sudo.
N(){
    sudo nnn -H 
}

[ -n "$NNNLVL" ] && PS1="n $PS1"

export NNN_TRASH=1
export EDITOR=vim
