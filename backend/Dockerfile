FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=development
EXPOSE 3001

CMD ["npm", "start"]
