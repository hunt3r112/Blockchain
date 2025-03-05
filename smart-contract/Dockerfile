# Use official Node.js image as a base
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY smart-contract/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY smart-contract/ .

# Run the Hardhat deployment script only during the build process
RUN npx hardhat run scripts/deploy.js --network ganache
