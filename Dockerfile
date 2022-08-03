FROM node:14.16.0-alpine

RUN apk add --repository ppa:libreoffice/ppa
RUN rm -rf /var/lib/apt/lists/* && apk update
RUN apk add bash vim git busybox-extras python ffmpeg libreoffice

# Microsoft fonts
RUN apk add --no-cache msttcorefonts-installer fontconfig
RUN update-ms-fonts
# Google fonts
RUN wget https://github.com/google/fonts/archive/main.zip -O gf.zip --no-check-certificate
RUN unzip gf.zip
RUN mkdir -p /usr/share/fonts/truetype/google-fonts
RUN find $PWD/fonts-main/ -name "*.ttf" -exec install -m644 {} /usr/share/fonts/truetype/google-fonts/ \; || return 1
RUN rm -f gf.zip && rm -rf $PWD/fonts-main
RUN fc-cache -f && rm -rf /var/cache/*

RUN npm install -g nodemon pm2 yarn --force

RUN mkdir -p /app
WORKDIR /app

# Copy app files into app folder
COPY . /app
RUN yarn \
    && ls -la /app
VOLUME /app

# Clear old entrypoint
RUN rm -rf /usr/local/bin/docker-entrypoint.sh
COPY docker-entrypoint.sh /usr/local/bin/
RUN sed -i -e 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh && ln -s /usr/local/bin/docker-entrypoint.sh /
ENTRYPOINT ["docker-entrypoint.sh"]
