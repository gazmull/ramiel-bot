FROM node:10-alpine

LABEL name "ramiel-client"
LABEL version "0.1.0"
LABEL maintainer "Euni <vescalaw@gmail.com>"

WORKDIR /usr/src/ramiel-client

COPY [ "package.json", "yarn.lock", "./" ]

RUN apk add --update \
&& apk add --no-cache --virtual .dependencies git curl build-base python g++ make \
&& yarn \
&& apk del .dependencies

COPY . .

RUN if ls | grep "auth.js"; then mv auth.js auth.js.bak; fi
RUN cp auth.example.js auth.js
RUN yarn compile
RUN if ls | grep "auth.js.bak"; then rm auth.js && mv auth.js.bak auth.js; fi

ENV NODE_ENV production

CMD [ "node", "build/index.js" ]
