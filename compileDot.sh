#!/bin/bash

echo "digraph {"
./compileDependencies.sh | while read line ; do 
  echo $line | sed \
      -e 's|src/||g' \
      -e 's|/|.|g' \
      -e 's|.js||g' \
      -e 's| |" -> "|g' \
      -e 's|$|";|g' \
      -e 's|^|  "|g'

done
echo "}"
