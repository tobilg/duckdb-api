# Use the official Node.js 23 image as base
FROM node:23-bookworm

USER node
WORKDIR /home/node
 
COPY package.json .
COPY tsconfig.json .
COPY src/ .
RUN npm i
 
ARG PORT
EXPOSE ${PORT:-3000}
 
CMD ["npm", "run", "serve"]
