# --- 階段 1: 編譯 React ---
FROM node:18-alpine AS builder

# 更新 Alpine OS 套件
RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- 階段 2: 建立 Nginx 服務 ---
FROM nginx:alpine

# 更新 Alpine OS 套件
RUN apk update && apk upgrade

# 複製 Nginx 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 複製靜態檔案
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# ★★★ 關鍵：前端的 CMD 必須是啟動 Nginx ★★★
CMD ["nginx", "-g", "daemon off;"]