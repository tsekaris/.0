#!/bin/sh

sudo ip link set wlp1s0 down #Αν το dhcpcd είναι ενεργοποιημένο σαν service
sudo netctl start wifi-tsek
