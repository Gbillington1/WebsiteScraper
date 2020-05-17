# @see https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker

FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./src/package*.json ./

USER node

RUN npm install

COPY --chown=node:node ./src .

CMD [ "node", "app.js" ]