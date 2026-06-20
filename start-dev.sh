#!/bin/bash
# Persistent dev server launcher — fully detaches from the calling shell.
cd /home/z/my-project
exec ./node_modules/.bin/next dev -p 3000 >> dev.log 2>&1
