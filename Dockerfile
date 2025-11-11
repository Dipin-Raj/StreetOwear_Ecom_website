# Start with an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
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

# Expose port 8000 to the outside world
EXPOSE 8000

# Command to run the application
CMD ["sh", "-c", "alembic upgrade head && export PYTHONPATH=$PYTHONPATH:/app && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"]
