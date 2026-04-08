FROM node:20-slim
WORKDIR /app

# Gerekli sistem paketlerini kur
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

# entrypoint scriptine çalışma yetkisi ver
RUN chmod +x entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
