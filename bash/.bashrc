#alias paok="echo 'paokra ole'"

pc () {
    sh $(find -L ~/.0 -name "*.sh"| fzf) # -L: και για τις συντομεύσεις
}

# Preventing nested ranger instances
ranger() {
    if [ -z "$RANGER_LEVEL" ]; then
        /usr/bin/ranger "$@"
    else
        exit
    fi
}
