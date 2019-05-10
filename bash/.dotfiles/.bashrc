#alias paok="echo 'paokra ole'"

# Εκτελείτε στο .bashrc με source

#if [ -z "$TMUX" ]; then
    #tmux attach -t pc || tmux new -s pc
#fi
menu () {
    echo $@ | fmt -1 | fzf
}

pc () {
    #Το $HOME στο termux είναι μακρύ.
    prefix=${HOME}/.0/
    #Εμφάνιση των scripts χωρίς το prefix.
    #Το -L απαραίτητο για συντομεύσεις
    script=$(find -L ~/.0 -name "*.sh" ! -name ".install.sh" | awk '{ gsub("'${prefix}'","",$1); print $1 }'| fzf)
    #Το όνομα του tmux window.
    #Χωρίς / που γίνεται -. Χωρίς .sh.7
    window=$(echo $script | awk '{ gsub("/","-",$1); print $1 }' | awk '{ gsub(".sh","",$1); print $1 }')
    
    #2>/dev/null για να μην εμφανίζει τα σφάλματα.
    #Εμφάνιση των ονομάτων (#S) των tmux sessions.
    sessions=$(tmux ls -F "#S" 2>/dev/null)
    #Εμφάνιση των ονομάτων (#W) των windows του session pc.
    windows=$(tmux lsw -t pc -F "#W" 2>/dev/null)
    
    if [ -f ${prefix}${script} ] 
    then #Αν έχει επιλεχθεί script που υπάρχει.
        if [ -z $(echo $sessions | grep -w pc) ]
        then # Αν δεν υπάρχει το session pc.
            tmux new -s pc -n ${window} -d "sh ${prefix}${script};exit"
        else #Αν υπάρχει το session pc.
            if [ -z $(echo $windows | grep -w $window) ]
            then #Αν υπάρχει το window.
                tmux new-window -t pc -n ${window} -d "sh ${prefix}${script};exit"
            #else #Αν υπάρχει το window.
            fi
        fi
        tmux select-window -t pc:${window}
        tmux a -t pc
    else #Αν έχει επιλεχθεί script που δεν υπάρχει.
        tmux a -t pc || tmux new -s pc
    fi
}

pc_ () {
    prefix=${HOME}/.0/
    script=$(find -L ~/.0 -name "*.sh" | awk '{ gsub("'${prefix}'","",$1); print $1 }'| fzf)
    session=$(echo $script | awk '{ gsub("/","-",$1); print $1 }' | awk '{ gsub(".sh","",$1); print $1 }')

    if [ -f ${prefix}${script} ]
    then
        tmux a -t ${session} || tmux new -s ${session} "sh ${prefix}${script}"
    fi
}


press_enter () {
    echo "Press enter to continue."
    read dummy
}

# Preventing nested ranger instances
ranger() {
    if [ -z "$RANGER_LEVEL" ]; then
        /usr/bin/ranger "$@"
    else
        exit
    fi
}

# fzf dropdown list and not dropup
export FZF_DEFAULT_OPTS="--layout=reverse --height 40%"
