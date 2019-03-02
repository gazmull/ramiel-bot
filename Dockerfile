FROM node:11.2.0-alpine AS build

LABEL name "ramiel-bot"
LABEL version "0.1.0"
LABEL maintainer "Euni <vescalaw@gmail.com>"

COPY . /ramiel-client
WORKDIR /ramiel-client

RUN apk add --update \
  && apk add --no-cache --virtual .dependencies git curl build-base python g++ make \
  && yarn \
  && apk del .dependencies

RUN if ls | grep "auth.js"; then mv auth.js auth.js.bak; fi
RUN cp auth.example.js auth.js && yarn compile
RUN if ls | grep "auth.js.bak"; then rm auth.js && mv auth.js.bak auth.js; fi
RUN if ! ls | grep "provider"; then mkdir provider && touch provider/ramiel.db; fi

# ---

FROM node:11.2.0-alpine

WORKDIR /ramiel-client

COPY --from=build /ramiel-client/node_modules node_modules
COPY --from=build /ramiel-client/provider provider
COPY --from=build /ramiel-client/build build
COPY --from=build /ramiel-client/auth.js /ramiel-client/package.json ./

ENV NODE_ENV production

CMD node ./build/index.js
