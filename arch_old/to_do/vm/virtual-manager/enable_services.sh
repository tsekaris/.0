#!/bin/sh

sudo systemctl enable --now libvirtd.service virtlogd.socket ebtables.service dnsmasq.service
sudo gpasswd -a tsekaris libvirt
#sudo echo intel_iommu=on >> /etc/default/grub
#sudo echo iommu=pt >> /etc/default/grub
 
# Δυστυχώς δεν υπάρχει iommu για το turbox. Πολύ φτωχό bios και δεν μπορώ να βρω update. Στο bios θα έπρεπε να βρω VT-d enabled. Προσοχή όχι VT-x που είναι για το kvm και αυτό το έχει ενεργό το turbox (χωρίς να το εμφανίζει στο bios menu). Για να δούμε αν μπορεί να τρέξει passthrough τρέχω:

#dmesg | grep -e DMAR -e IOMMU
