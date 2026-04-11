FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PIP_NO_CACHE_DIR=1 \
  PADDLEOCR_LANGUAGE=cyrillic \
  DOCUMENT_OCR_SOURCE_DIR=/automation-samples \
  DOCUMENT_OCR_OUTPUT_DIR=/automation-output \
  DOCUMENT_OCR_WORKER_PORT=8080

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libfontconfig1 \
    libice6 \
  && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY src ./src

RUN pip install --upgrade pip \
  && pip install .

COPY scripts ./scripts

EXPOSE 8080

CMD ["python", "-m", "document_intelligence.worker"]
