#!/bin/bash

for f in *.mp3; do
  ffmpeg -i "$f" -ac 1 -y "tmp_$f" && mv "tmp_$f" "$f"
done
