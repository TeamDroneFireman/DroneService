#!/bin/bash

#add random copter in order to start the simulator
dronekit-sitl copter --home=48.1234622,-1.6426367000000255,584,353 &

#start mavlink
mavproxy.py --master tcp:127.0.0.1:5760 --sitl 127.0.0.1:5501 --out 127.0.0.1:14550 --out 127.0.0.1:14551 &
