import { WebSocketServer, WebSocket } from 'ws'

interface Client {
  id: string
  ws: WebSocket
  type: 'teacher' | 'student'
  answers?: any[]
}

class AudioTestServer {
  private clients: Map<string, Client> = new Map()
  private currentTest: any = null
  private currentQuestionIndex: number = -1

  constructor(private wss: WebSocketServer) {
    this.setupWebSocketServer()
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      // 检查连接类型（是教师还是学生）
      const isTeacher = request.url?.includes('?type=teacher')
      const clientId = Date.now().toString()
      
      console.log(`New ${isTeacher ? 'teacher' : 'student'} connected: ${clientId}`)
      
      // 保存客户端信息
      this.clients.set(clientId, {
        id: clientId,
        ws,
        type: isTeacher ? 'teacher' : 'student',
        answers: []
      })

      // 发送初始连接消息
      this.sendToClient(ws, {
        type: isTeacher ? 'teacher-connected' : 'student-id',
        id: clientId
      })

      // 如果是新学生连接，通知所有教师
      if (!isTeacher) {
        this.broadcastToTeachers({
          type: 'student-connected',
          studentId: clientId,  // 添加 studentId
          student: {
            id: clientId,
            name: `学生${clientId}`,  // 添加默认名称
            status: 'waiting'
          }
        })
      }

      // 如果测试正在进行，发送当前状态
      if (this.currentTest && !isTeacher) {
        this.sendToClient(ws, {
          type: 'test-start',
          test: this.currentTest,
          currentQuestion: this.currentQuestionIndex
        })
      }

      // 设置消息处理
      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(clientId, message)
        } catch (error) {
          console.error('Error handling message:', error)
        }
      })

      // 处理连接关闭
      ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`)
        const client = this.clients.get(clientId)
        if (client) {
          if (client.type === 'student') {
            // 通知所有教师学生断开连接
            this.broadcastToTeachers({
              type: 'student-disconnected',
              studentId: clientId
            })
          }
          this.clients.delete(clientId)
        }
      })
    })
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    console.log(`Received message from ${client.type}:`, message.type)

    switch (message.type) {
      case 'start-test':
        if (client.type === 'teacher') {
          this.handleStartTest(message.test)
        }
        break

      case 'next-question':
        if (client.type === 'teacher') {
          this.handleNextQuestion()
        }
        break

      case 'submit-answer':
        if (client.type === 'student') {
          this.handleStudentAnswer(clientId, message.answer)
        }
        break

      case 'stop-test':
        if (client.type === 'teacher') {
          this.handleStopTest()
        }
        break
    }
  }

  private handleStartTest(test: any) {
    console.log('Starting test:', test)
    this.currentTest = test
    this.currentQuestionIndex = 0
    
    // 向所有学生广播测试开始
    this.broadcastToStudents({
      type: 'test-start',
      test: this.currentTest,
      questionIndex: this.currentQuestionIndex
    })

    // 通知教师测试已开始
    this.broadcastToTeachers({
      type: 'test-started',
      test: this.currentTest,
      questionIndex: this.currentQuestionIndex
    })
  }

  private handleNextQuestion() {
    if (!this.currentTest) return

    this.currentQuestionIndex++
    console.log('Moving to next question:', this.currentQuestionIndex)

    if (this.currentQuestionIndex >= this.currentTest.questions.length) {
      this.handleStopTest()
      return
    }

    // 向所有学生广播新题目
    this.broadcastToStudents({
      type: 'question-start',
      questionIndex: this.currentQuestionIndex
    })

    // 通知教师当前题目状态
    this.broadcastToTeachers({
      type: 'question-started',
      questionIndex: this.currentQuestionIndex
    })
  }

  private handleStudentAnswer(studentId: string, answer: any) {
    const client = this.clients.get(studentId)
    if (!client) return

    console.log('Student answer:', studentId, answer)

    // 保存答案
    if (!client.answers) client.answers = []
    client.answers.push(answer)

    // 通知所有教师新的答案
    this.broadcastToTeachers({
      type: 'answer-submitted',
      studentId,
      answer: {
        ...answer,
        isCorrect: answer.option === this.currentTest.questions[this.currentQuestionIndex].correctOption
      }
    })
  }

  private handleStopTest() {
    console.log('Stopping test')
    this.currentTest = null
    this.currentQuestionIndex = -1

    // 通知所有参与者测试结束
    this.broadcastToAll({
      type: 'test-end'
    })
  }

  private sendToClient(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private broadcastToTeachers(message: any) {
    const messageStr = JSON.stringify(message)
    for (const client of this.clients.values()) {
      if (client.type === 'teacher' && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr)
      }
    }
  }

  private broadcastToStudents(message: any) {
    const messageStr = JSON.stringify(message)
    for (const client of this.clients.values()) {
      if (client.type === 'student' && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr)
      }
    }
  }

  private broadcastToAll(message: any) {
    const messageStr = JSON.stringify(message)
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr)
      }
    }
  }
}

export function setupWebSocketServer(wss: WebSocketServer) {
  new AudioTestServer(wss)
}