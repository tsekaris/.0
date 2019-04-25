#!/bin/sh

#mosquitto -c /etc/mosquitto/mosquitto.conf

# Αν δεν υπάρχει ο φάκελος να δημιουργηθεί
[ -d $HOME/server ] || mkdir $HOME/server 

cd $HOME/server

# Δημιουργία mosquitto.conf
cat > .hello <<EOF
Hello PAOK. Server is working.
EOF
mosquitto -c $HOME/.0/mosquitto/data/mosquitto.conf -v
