# Gesture Game

## Package installation
```bash
pip install -r requirements.txt
```

## How to start the server
1. Start the redis
    ```bash
    docker run --rm -p 6379:6379 redis:7
    ```
2. Start the GestureGame Back-end
    ```bash
    cd mainsite
    python3 manage.py runserver
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