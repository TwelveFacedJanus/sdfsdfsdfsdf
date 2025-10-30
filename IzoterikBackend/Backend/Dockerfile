FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PDM
RUN pip install pdm

# Copy PDM files
COPY pyproject.toml pdm.lock ./

# Install dependencies
RUN pdm install --prod --no-lock

# Copy project
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["pdm", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
