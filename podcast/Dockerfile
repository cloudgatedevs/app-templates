FROM node:18 as builder

WORKDIR /home

COPY . .

RUN npm install --legacy-peer-deps
RUN npm run build

FROM builder

WORKDIR /home

COPY package.json /home/
COPY run.sh /home/
RUN chmod 777 /home/run.sh

COPY --from=builder /home/dist /home/dist
COPY --from=builder /home/node_modules /home/node_modules

EXPOSE 4200

CMD sh '/home/run.sh'
