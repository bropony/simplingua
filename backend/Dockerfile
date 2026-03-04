FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app
COPY ./main.py ./main.py

# Create non-root user
RUN useradd -m -u 1000 simpingua && \
    chown -R simpingua:simplingua /app
USER simpingua

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
