#!/bin/bash

# 创建 askai 目录，如果不存在则创建
mkdir -p askai

# 递归查找 src 目录下的所有 .ts 和 .tsx 文件，并复制到 askai 目录下
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec bash -c 'cp "$0" askai/"$(basename "$0")"' {} \;

echo "所有 .ts 和 .tsx 文件已以扁平方式复制到 askai 目录下"
