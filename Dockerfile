FROM denoland/deno:alpine

# 设置工作目录
WORKDIR /app

# 复制所有应用程序文件
COPY . .

# 预热缓存
RUN deno cache --reload --lock=deno.lock main.ts

# 暴露应用程序端口
EXPOSE 80

# 运行应用程序
CMD ["deno", "run", "--allow-net", "--allow-env", "--unstable-worker-options", "main.ts"]