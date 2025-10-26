FROM node:18-alpine

# 更新 Alpine OS 套件
RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./

# --- 修正開始 ---
# 1. 先安裝「所有」依賴 (包含 devDependencies, 例如 typescript)
#    (此時 NODE_ENV 尚未設定，所以 npm install 會安裝所有東西)
RUN npm install

# 2. 複製所有原始碼
COPY . .

# 3. 現在執行 build (tsc 指令一定存在)
RUN npm run build

# 4. ★★★ 現在才設定 NODE_ENV=production ★★★
#    這會告訴 knex 和 express 要用生產模式
ENV NODE_ENV=production

# 5. ★★★ 現在才移除 devDependencies ★★★
#    (build 已經完成了，我們不再需要 typescript 了)
RUN npm prune --production
# --- 修正結束 ---

EXPOSE 3001

# 6. 啟動伺服器 (這部分不變，是正確的)
CMD [ "sh", "-c", "npx knex migrate:latest --knexfile dist/knexfile.js && node dist/src/index.js" ]