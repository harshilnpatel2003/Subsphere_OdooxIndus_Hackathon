#!/bin/bash
rm -f db.sqlite3
find apps -path "*/migrations/*.py" -not -name "__init__.py" -delete
find apps -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
python setup_db.py
