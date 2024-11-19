import { ref } from 'vue'
import type { TestStatus, QuestionStatus, Answer } from '../types'

export function useTestStore() {
  const testState = ref<TestStatus>('waiting')
  const questionState = ref<QuestionStatus>('waiting')
  const currentQuestionStartTime = ref<number>(0)
  const answers = ref<Answer[]>([])

  const startTest = () => {
    testState.value = 'started'
    answers.value = []
  }

  const startQuestion = () => {
    questionState.value = 'active'
    currentQuestionStartTime.value = Date.now()
  }

  const submitAnswer = (answer: Answer) => {
    answers.value.push(answer)
    questionState.value = 'answered'
  }

  const endTest = () => {
    testState.value = 'ended'
    questionState.value = 'waiting'
  }

  return {
    testState,
    questionState,
    currentQuestionStartTime,
    answers,
    startTest,
    startQuestion,
    submitAnswer,
    endTest
  }
}