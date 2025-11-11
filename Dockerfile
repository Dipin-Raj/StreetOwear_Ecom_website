# Start with an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

ENV PYTHONPATH=/app

# Copy the requirements file into the container at /app
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container at /app
COPY . /app

# Expose port 8000 to the outside world
EXPOSE 8000

# Command to run the application
# Use 0.0.0.0 to make it accessible from outside the container
# The port should match the one your deployment service expects, 8000 is common.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
