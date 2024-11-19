export interface Test {
    id: string
    name: string
    questions: Question[]
  }
  
  export interface Question {
    id: number
    audioFile: string
    correctOption: string
  }
  
  export interface Answer {
    questionId: number
    option: string
    timestamp: number
    startTime: number
    isCorrect?: boolean
  }
  
  export interface Student {
    id: string
    name?: string
    status: 'waiting' | 'answering' | 'answered'
    lastAnswer?: Answer
  }
  
  declare global {
    interface Window {
      electronAPI: {
        playAudio: (file: string) => Promise<void>
        stopAudio: () => Promise<void>
      }
    }
  }