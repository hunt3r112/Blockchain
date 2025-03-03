# Use official Node.js image as a base
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY backend/ .

# Expose the port that the backend server will run on
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
