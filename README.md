# Gesture Game

## Package installation
```bash
pip install -r requirements.txt
```

## How to start the server
1. Modify the variable in `compose.sh` based on your needs.
2. Run with rootless docker
    ```bash
    bash compose.sh
    ```

## Folder structure
```
.
├── mainsite
│   ├── db.sqlite3
│   ├── game
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── consumers.py
│   │   ├── engine
│   │   │   ├── engine.py
│   │   │   ├── __init__.py
│   │   │   └── models.py
│   │   ├── __init__.py
│   │   ├── migrations
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── routing.py
│   │   ├── static
│   │   │   ├── css
│   │   │   └── js
│   │   │       ├── index.js
│   │   │       └── room.js
│   │   ├── templates
│   │   │   ├── index.html
│   │   │   └── room.html
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── mainsite
│   │   ├── asgi.py
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── manage.py
├── README.md
└── requirements.txt
```