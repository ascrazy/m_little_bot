FROM mcr.microsoft.com/devcontainers/base:ubuntu

USER 1000:1000

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && \
  sudo apt-get install -y nodejs && \
  sudo apt-get clean && \
  sudo npm upgrade -g

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH $PATH:~/.bun/bin
