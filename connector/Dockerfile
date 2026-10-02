# Dockerfile for Django backend

# Use an official Python runtime as a parent image
FROM python:3.9-alpine

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY ./requirements.txt .
RUN apk add --no-cache make gcc g++ libpq-dev openssh git nodejs npm
RUN pip install -r ./requirements.txt --no-cache-dir
RUN npm install -g @dodona/dolos@2.7.0

# Copy the current directory contents into the container
COPY . .

# Create the SSH directory
RUN mkdir /root/.ssh/

# Copy the SSH key and set the permissions
RUN mv /app/id_rsa /root/.ssh/id_rsa
RUN mv /app/id_rsa.pub /root/.ssh/id_rsa.pub
RUN chmod 600 /root/.ssh/id_rsa
RUN ssh-keyscan git.rwth-aachen.de >> /root/.ssh/known_hosts

# Expose port 8000
EXPOSE 8000

# Run the Django development server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
