FROM node:lts-alpine
USER node
WORKDIR /app
ENV NODE_ENV production
COPY --chown=node:node index.mjs ./
EXPOSE 3000
CMD ["node", "./index.mjs"]
