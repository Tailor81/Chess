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

# Security: create non-root user
RUN useradd -m chess
USER chess

# Install wheels built in the previous stage
COPY --from=builder /wheels /wheels
COPY --from=builder /usr/local/bin/pip /usr/local/bin/pip
RUN pip install --no-cache-dir /wheels/*

# Copy application source (including static assets & templates)
COPY --chown=chess . .

# FastAPI listens on $PORT provided by Render/Heroku/etc.
ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
