# Use official Node.js image as a base for React
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies, including ethers
RUN npm install

# Copy the rest of the application
COPY frontend/ .

# Build the React application
RUN npm run build

# Install a simple server to serve the static files
RUN npm install -g serve

# Expose the port that the frontend will run on
EXPOSE 3000

# Serve the React app
CMD ["serve", "-s", "build", "-l", "3000"]
