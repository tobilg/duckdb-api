FROM node:23-alpine as builder

RUN apk update && apk add python3-dev gcc libffi-dev make g++

USER node
WORKDIR /home/node
 
COPY package.json .
COPY tsconfig.json .
COPY src/ src/
RUN npm i

FROM node:23-alpine as runner

USER node
WORKDIR /home/node

COPY --from=builder /home/node/node_modules/ node_modules/
COPY --from=builder /home/node/src/ src/
COPY --from=builder /home/node/package.json .
COPY --from=builder /home/node/tsconfig.json .

ARG PORT
EXPOSE ${PORT:-3000}
 
CMD ["npm", "run", "serve"]