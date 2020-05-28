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
