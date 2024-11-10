FROM node:20-bookworm-slim

USER node
WORKDIR /home/node
 
COPY package.json .
COPY tsconfig.json .
COPY src/ src/
RUN npm i

ARG PORT
EXPOSE ${PORT:-3000}
 
CMD ["npm", "run", "serve"]