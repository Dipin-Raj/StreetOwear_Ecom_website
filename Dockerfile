# Start with an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Explicitly copy the 'app' directory
COPY ./app /app/app

# Copy other necessary files
COPY ./alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic
COPY ./main.py /app/main.py
COPY ./migrate.py /app/migrate.py
COPY ./run.py /app/run.py
COPY ./README.md /app/README.md
COPY ./uploads /app/uploads

# Install wget
RUN apt-get update && apt-get install -y wget --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Download local_dump.sqlc directly from GitHub
RUN wget https://raw.githubusercontent.com/Dipin-Raj/StreetOwear_Ecom_website/main/local_dump.sqlc

# Expose port 8000 to the outside world
EXPOSE 8000

# Command to run the application
# Use 0.0.0.0 to make it accessible from outside the container
# The port should match the one your deployment service expects, 8000 is common.
CMD ["sh", "-c", "pg_restore -U fastapiecom_db_user -d fastapiecom_db -h dpg-d49dh83e5dus73cm1iv0-a /app/local_dump.sqlc && exit 0"]
