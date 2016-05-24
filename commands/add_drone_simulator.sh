#!/bin/bash

#add new copter into simulator
dronekit-sitl copter --home=$1,$2,$3,$4 --instance=$5 &
