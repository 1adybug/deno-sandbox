# Deno 沙箱执行服务

这是一个基于 Deno 的安全沙箱服务，允许在隔离环境中执行 JavaScript 代码。

## 功能特点

- 通过 Web API 接收 JavaScript 代码并在沙箱中执行
- 支持超时控制，防止长时间运行的脚本
- 网络访问限制，只允许访问预先配置的主机名
- 使用 Web Worker 确保代码在隔离环境中运行
- 完整的错误处理和超时检测
- 通过 `postMessage` 接受返回值

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `ALLOWED_HOSTNAMES` | 允许脚本访问的主机名列表，以逗号分隔 | `""` (空，不允许网络访问) |
| `DEFAULT_TIMEOUT` | 脚本执行的默认超时时间（秒） | `10` |
| `MAX_TIMEOUT` | 脚本执行的最大超时时间（秒） | `30` |

## 安装和运行

### 使用Docker

```bash
# 构建Docker镜像
docker build -t deno-sandbox .

# 运行容器
docker run -p 80:80 -e ALLOWED_HOSTNAMES=example.com,api.example.org deno-sandbox
```

## API使用

### POST /

执行 JavaScript 代码。

#### 请求体

| 字段 | 类型 | 描述 | 是否必需 |
|------|------|------|----------|
| `script` | string | 要执行的 JavaScript 代码 | 是 |
| `timeout` | number | 执行超时时间（秒） | 否，默认为 `DEFAULT_TIMEOUT` |

```json
{
  "script": `const a = 1 + 1
postMessage(a)`,
  "timeout": 5
}
```

#### 返回值

| 字段 | 类型 | 描述 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `data` | any | 返回值 |
| `message` | string | 错误信息 |

**成功响应**:

```json
{
  "success": true,
  "data": 2,
  "message": null
}
```

**错误响应**:

```json
{
  "success": false,
  "data": null,
  "message": "错误信息"
}
```

## 安全注意事项

- 所有执行的代码都在 Web Worker 中运行，以限制其访问权限
- 网络访问仅限于预定义的主机名
- 所有脚本都有执行时间限制
