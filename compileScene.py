#!/usr/bin/env python
#Takes output from src/cubeCompiler.js

import sys
import json

def readJson(file):
    return json.loads(open(file).read())

def parseLine(line):
    words = line.split(" ", 1)
    id = words[0].split(".")

    result = {}
    result["name"] = id[0]
    result["attr"]  = id[1]
    result["values"] = words[1].strip().split(", ")
    return result;

line = sys.stdin.readline();
result = {}
while line != "":
    obj = parseLine(line)
    name = obj["name"]
    d = {}
    if name in result:
        d = result[name]
    d[obj["attr"]] = obj["values"];
    result[name] = d;
    line = sys.stdin.readline()

compiled = readJson(sys.argv[1])
del compiled["cubes"];
compiled["compiledCubes"] = result;
print json.dumps(compiled, indent = 1)
