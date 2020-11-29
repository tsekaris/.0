#!/bin/sh

sudo ip link set wlp4s0 down #Αν το dhcpcd είναι ενεργοποιημένο σαν service
sudo netctl start wifi_tencool
