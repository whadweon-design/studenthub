#!/bin/bash
cd "$(dirname "$0")"
open "http://localhost:5173"
if ! lsof -i :5173 > /dev/null; then
    npm run dev
fi
