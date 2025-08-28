# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=8000
ENV CLIENT_ORIGIN=http://localhost:5173

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
