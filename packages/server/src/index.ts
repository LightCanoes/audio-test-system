import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { setupWebSocketServer } from './websocket'

const app = express()
const port = process.env.PORT || 8080

// 创建 HTTP 服务器
const server = createServer(app)

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server })

// 设置 WebSocket 服务器
setupWebSocketServer(wss)

// 启动服务器
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
