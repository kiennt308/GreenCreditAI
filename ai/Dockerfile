# Builder staging to install all libraries
FROM python:3.10.12-slim AS builder

RUN pip install poetry
COPY ../pyproject.toml ../poetry.lock ./
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction

# Run stage
FROM python:3.10.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy from builder stage
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY .. .

ENV FLASK_HOST=0.0.0.0 \
    FLASK_PORT=5000

    EXPOSE ${FLASK_PORT}

CMD ["python3", "-m", "run.run"]
