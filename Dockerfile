FROM node:lts-alpine
USER node
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Europe/Warsaw
COPY --chown=node:node index.mjs ./
EXPOSE 3000
CMD ["node", "./index.mjs"]

HEALTHCHECK \
  --interval=10s \
  --timeout=5s \
  --start-period=3s \
  --retries=3 \
  CMD ["wget", "http://localhost/health", "-O", "/dev/null", "-q"]
