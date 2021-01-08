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
    # nnn -H 
    export NNN_TMPFILE="$HOME/.config/nnn/.lastd"

    nnn -H "$@"

    if [ -f "$NNN_TMPFILE" ]; then
        . "$NNN_TMPFILE"
        rm -f "$NNN_TMPFILE" > /dev/null
    fi

}
#Δεν λειτουργεί στο termux γιατί δεν υπάρχει sudo.
N(){
    sudo nnn -H 
}

[ -n "$NNNLVL" ] && PS1="n $PS1"
export NNN_PLUG='p:pc;b:bash;t:test'
