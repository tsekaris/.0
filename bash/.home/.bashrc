PAGER=more

pc () {
    #Οι εντολές εκτελούνται με bash για να δουλέψουμε με τα search με /.
    #Το $HOME στο termux είναι μακρύ.
    prefix=${HOME}/.0/
    #Εμφάνιση των scripts χωρίς το prefix.
    #Το -L απαραίτητο για συντομεύσεις
    script=$(find -L ~/.0 -name "*.sh" -or -name "*.pc.js" ! -name ".install.sh" ! -name ".install_all.sh" | awk '{ gsub("'${prefix}'","",$1); print $1 }'| fzf)
    case "$1" in
        w)
            #Το όνομα του tmux window.
            #Χωρίς / που γίνεται -. Χωρίς .sh.
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
                    tmux new -s pc -n ${window} -d "bash ${prefix}${script};exit"
                else #Αν υπάρχει το session pc.
                    if [ -z $(echo $windows | grep -w $window) ]
                    then #Αν υπάρχει το window.
                        tmux new-window -t pc -n ${window} -d "bash ${prefix}${script};exit"
                    #else #Αν υπάρχει το window.
                    fi
                fi
                tmux select-window -t pc:${window}
                tmux a -t pc
            else #Αν έχει επιλεχθεί script που δεν υπάρχει.
                tmux a -t pc || tmux new -s pc
            fi
            ;;
        s)
            #read -p "In progress." dummy
            session=$(echo $script | awk '{ gsub("/","-",$1); print $1 }' | awk '{ gsub(".sh","",$1); print $1 }')
            tmux a -t ${session} || tmux new -s ${session} "bash ${prefix}${script}"
            ;;
        *)
            if [ -f ${prefix}${script} ] 
            then #Αν έχει επιλεχθεί script που υπάρχει.
                if echo "$script" | grep -q ".pc.js"; then
                  node ${prefix}${script}
                else
                  bash ${prefix}${script}
                fi
            fi
            ;;
    esac
}
export -f pc #για να το χρησιμοποιώ σε scripts

ui(){
  #ui: user interface
  local msg=$1
  if [ $# -gt 1 ]; then
    echo -n $msg
    while [[ true ]]; do
      # Το fzf θέλει στήλες.
      ui=$(IFS=$'\n'; echo "${*:2}" |  fzf )
      if [[ -z $ui ]]; then
        echo -n "Try again. $msg"
      else
        echo "$msg $ui"
        break;
      fi
    done
  else
    read -p "$msg " ui
  fi
}
export -f ui #για να το χρησιμοποιώ σε scripts


q(){
  exit
}
:q(){
  exit
}


set -o vi #vi mode for bash
