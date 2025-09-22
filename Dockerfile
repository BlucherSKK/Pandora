FROM archlinux:latest

# Update the package database and install ffmpeg and unzip without confirmation
RUN pacman -Syyu --noconfirm ffmpeg unzip

# Install Bun using the official installation script
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to the PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Install dependencies using Bun
RUN bun install
RUN bun init

# Указываем команду для запуска приложения
CMD ["bun", "run", "main.ts"]
