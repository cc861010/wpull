FROM cc861010/puppeteer
RUN mkdir /app
WORKDIR /app
ADD index.js .
ADD package.json .
RUN npm install
ENTRYPOINT ["./index.js"]
