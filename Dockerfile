FROM node:10-alpine

LABEL name "ramiel-client"
LABEL version "0.1.0"
LABEL maintainer "Euni <vescalaw@gmail.com>"

WORKDIR /usr/src/ramiel-client

COPY [ "package.json", "yarn.lock", "./" ]

RUN apk add --update \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn \
&& apk del .build-deps

COPY . .

RUN yarn compile

ENV NODE_ENV production

CMD [ "node", "build/index.js" ]
