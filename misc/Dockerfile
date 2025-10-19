# Dockerfile

# 1. Use an official Python runtime as a parent image
FROM python:3.9-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the Python script and all JSON data files into the container
COPY . .

# 5. Set the command to run the Python script when the container starts
CMD ["python", "insert_data.py"]