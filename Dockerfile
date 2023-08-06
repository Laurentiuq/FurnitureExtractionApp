FROM python:latest
WORKDIR /app

COPY client flask-server requirements.txt ./
RUN pip install -r ./requirements.txt

EXPOSE 5000


RUN useradd -m myuser
USER myuser

CMD gunicorn --bind 0.0.0.0:$PORT server:app

# CMD ["gunicorn", "-b", "$PORT", "server:app"]