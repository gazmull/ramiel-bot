FROM node:11.2.0-alpine AS build

LABEL name "ramiel-bot"
LABEL version "0.1.0"
LABEL maintainer "Euni <vescalaw@gmail.com>"

COPY . /ramiel-client
WORKDIR /ramiel-client

RUN apk add --update \
  && apk add --no-cache --virtual .dependencies git make gcc g++ python \
  && yarn \
  && apk del .dependencies

RUN if ls | grep "auth.js"; then mv auth.js auth.js.bak; fi
RUN cp auth.example.js auth.js && yarn compile
RUN if ls | grep "auth.js.bak"; then rm auth.js && mv auth.js.bak auth.js; fi

# ---

FROM node:11.2.0-alpine

WORKDIR /ramiel-client

COPY --from=build /ramiel-client/node_modules node_modules
COPY --from=build /ramiel-client/build build
COPY --from=build /ramiel-client/auth.js /ramiel-client/package.json ./

CMD node ./build/index.js
