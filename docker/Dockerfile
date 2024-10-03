FROM node:20.17.0

# Install PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

#Install dependencies
RUN apt-get update && \
  apt-get --no-install-recommends -y install sudo pkg-config build-essential gnupg2 git libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 && \
  apt-get clean  && \
  rm -rf /var/lib/apt/lists

ENV PKG_CONFIG_PATH=/usr/bin/pkg-config
ENV LIBSSL_DEV_PATH=/usr/bin/libssl-dev

# 日本語が使えるようにする
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y locales
RUN locale-gen ja_JP.UTF-8

ENV LANG=ja_JP.UTF-8
ENV LC_CTYPE=ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP.utf8

RUN mkdir -p /home/node/workspace/kyuko/node_modules && \
  mkdir -p /home/node/workspace/kyuko/.pnpm-store && \
  chown -R node:node /home/node/workspace


# set workdir
WORKDIR /home/node/workspace

USER node
