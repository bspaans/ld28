#!/usr/bin/env python

import glob
import os.path
import sys

result = ""
def compileShader(fs, type):
    global result;
    shader = os.path.basename(fs)
    result += "<script id='" + shader + "' type='" + type + "'>\n"
    result += open(fs).read()
    result += "</script>\n"

for fs in glob.glob("resources/*.fs.shader"):
    compileShader(fs, "x-shader/x-fragment")
for fs in glob.glob("resources/*.vs.shader"):
    compileShader(fs, "x-shader/x-vertex");

template = open(sys.argv[1]).read()
print template.replace("{%shaders%}", result);
