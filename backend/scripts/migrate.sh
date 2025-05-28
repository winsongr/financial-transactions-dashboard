#!/bin/sh
/app/scripts/wait-for-it.sh postgres:5432 --timeout=30 --strict -- \
uvicorn main:app --host 0.0.0.0 --port 8000
