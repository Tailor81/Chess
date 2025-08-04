# ---------------------------
# Build stage – install deps
# ---------------------------
FROM python:3.11-slim AS builder
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip wheel --no-cache-dir --no-deps -r requirements.txt -w /wheels

# ---------------------------
# Runtime stage – minimal
# ---------------------------
FROM python:3.11-slim
WORKDIR /app

# Copy wheels and install them *as root* so they go to the global site-packages
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# Copy application source (including static assets & templates)
COPY . .

# After everything is in place, drop privileges
RUN useradd -m chess
USER chess

# FastAPI listens on $PORT provided by Render/Heroku/etc.
ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
