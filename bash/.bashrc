#alias paok="echo 'paokra ole'"

pc-arena () {
    pkill mpv
    mpv http://eco.onestreaming.com:8418/;stream.mp3
}

pc-ipiros () {
    pkill mpv
    mpv http://213.239.206.179:9450
}

pc-libero () {
    pkill mpv
    mpv http://eco.onestreaming.com:8081/listen.pls
}

pc-metropolis () {
    pkill mpv
    mpv http://s6.voscast.com:10478
}

pc-rainbow () {
    pkill mpv
    mpv http://62.212.82.197:8000
}

pc-trito () {
    pkill mpv
    mpv http://radiostreaming.ert.gr/ert-trito
}


pc-password () {
    passwd
}

pc-ssh-start () {
    sshd
    echo "Type:"
    echo "ssh -p 8022 termuxIp" 
}

pc-ssh-stop () {
    pkill sshd
}

pc-server-start () {
    #mosquitto -c /etc/mosquitto/mosquitto.conf

    # Αν δεν υπάρχει ο φάκελος να δημιουργηθεί
    [ -d $HOME/server ] || mkdir $HOME/server 

    cd $HOME/server

    # Δημιουργία mosquitto.conf
cat > .mosquitto.conf <<EOF
listener 1883
listener 8000
protocol websockets
http_dir /data/data/com.termux/files/home/server
EOF
    mosquitto -c ./.mosquitto.conf -v
}

pc-git-pull () {
    git pull
}

pc-git-push () {
    echo "Comment:"
    read comment
    git add .
    git commit -m "$comment"
    git push
}

pc-git-user () {
    git config user.name "tsekaris"
    git config user.email "tsemix@gmail.com"
}
