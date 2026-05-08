#!/bin/zsh
export PATH="/tmp/node/bin:$HOME/bin:$PATH"
exec node node_modules/next/dist/bin/next dev --webpack --port 3001
