#!/bin/bash

printRequired() {
    for r in $(echo $1) ; do echo $r $2 ; done ;
}

for x in src/*.js ; do 
    require=$(grep require $x | sed -e 's/^require(\[\(.*\)"\]);\?\s*$/\1.js/' -e 's/", /.js /g' -e 's/"/src\//g'  )  
    printRequired "$require" "$x" 
done | tsort
