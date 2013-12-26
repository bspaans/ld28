#!/bin/bash

printDependencies() {
    for r in $(echo $1) ; do echo $r $2 ; done ;
}
parseRequired() {
    sed \
        -e 's/^require(\[\(.*\)"\]);\?\s*$/\1.js/' \
        -e 's/", /.js /g' \
        -e 's/"/src\//g'  
}
printRequired() {
    require=$(grep require "$1" | parseRequired)  
    printDependencies "$require" "$1" 
}

find src -name "*.js" | while read file ; do 
    printRequired $file
done

