FROM python:3.11-alpine

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install -r requirements.txt

COPY ./mainsite/ ./

CMD ["python3", "/app/manage.py", "runserver", "0.0.0.0:8000"]
