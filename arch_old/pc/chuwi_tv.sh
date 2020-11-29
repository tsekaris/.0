#!/bin/sh

# Για να παίξει στην τηλεόραση
#xrandr --output HDMI2 --mode 4096x2160 --pos 0x0 --rotate normal --output HDMI1 --off --output DP1 --off --output eDP1 --off --output VIRTUAL1 --off
xrandr --output HDMI2 --auto --output HDMI1 --off --output DP1 --off --output eDP1 --off --output VIRTUAL1 --off
