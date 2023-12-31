FROM node:18-alpine AS deps

RUN apk --no-cache --virtual build-dependencies add make g++ libc6-compat python3

# Copy over ONLY the package.json and yarn.lock
# so that this `yarn install` layer is only recomputed
# if these dependency files change. Nice speed hack!
WORKDIR /app
COPY package.json ./
RUN yarn install --network-timeout 1000000

# Now we make a container to handle our Build
FROM node:18-alpine AS BUILD_IMAGE

# Set up our work directory again
WORKDIR /app

# Bring over the deps we installed and now also
# the rest of the source code to build the Next
# server for production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Remove all the development dependencies since we don't
# need them to run the actual server.
RUN rm -rf node_modules
RUN yarn install --production --ignore-scripts --prefer-offline --network-timeout 1000000
RUN yarn remove bcrypt && yarn add bcrypt
RUN yarn add --dev typescript @types/node --network-timeout 1000000 && yarn add prisma -g --network-timeout 1000000


FROM node:18-alpine

RUN apk update
RUN apk add --no-cache bash

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/package.json /app/yarn.lock ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/public ./public
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/.next ./.next
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/start.sh ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/.example.env ./.env
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/i18n.js ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/pages ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/components  ./components
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/layouts  ./layouts
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/styles  ./styles
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/lib  ./lib
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/locales  ./locales

ENV NODE_ENV production
ENV PORT 8223
EXPOSE 8223

CMD bash -C './start.sh';'bash'