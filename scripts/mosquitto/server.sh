#!/bin/sh

# Αν δεν υπάρχει ο φάκελος να δημιουργηθεί
[ -d $HOME/server ] || mkdir $HOME/server 

cd $HOME/server

create_hello_file (){
cat > .hello <<EOF
Hello PAOK. Server is working.
EOF
}

[ -f $HOME/server/.hello ] || create_hello_file

mosquitto -c $HOME/.0/mosquitto/data/mosquitto.conf -v
#tmux a -t mosquitto || tmux new -s mosquitto "mosquitto -c $HOME/.0/mosquitto/data/mosquitto.conf -v"
