FROM ghcr.io/puppeteer/puppeteer:latest
USER root
WORKDIR /app
RUN npm init -y && npm install express cors
COPY servidor/server.js .
COPY servidor/recursos/ ./recursos/
COPY servidor/templates/ ./templates/
ENV NODE_PATH=/app/node_modules:/home/pptruser/node_modules
EXPOSE 3005
USER pptruser
CMD ["node", "server.js"]
