export interface Test {
  id: string
  name: string
  questions: Question[]
}

export interface Question {
  id: number
  audio1: string
  audio2: string
  pauseTime: number
  answerTime: number
  correctOption: string
  instruction?: {
    title: string
    content: string
  }
}

export interface Student {
  id: string
  name?: string
  status: 'waiting' | 'answering' | 'answered'
  lastAnswer?: Answer
}

export interface Answer {
  questionId: number
  option: string
  timestamp: number
  startTime: number
  isCorrect?: boolean
}

export interface AudioFile {
  id: string
  name: string
  path: string
  duration: number
}

export interface TestStats {
  correctRate: number
  averageTime: number
  questionStats: Record<number, {
    total: number
    correct: number
    averageTime: number
  }>
}