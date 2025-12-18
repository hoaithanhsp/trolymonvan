export interface ExamConfig {
  level: string; // 'Tiểu học' | 'THCS' | 'THPT'
  gradeLevel: string;
  examType: string;
  topic: string;
  trendingTopic: string;
  matrixContent: string;
  specificationContent: string;
  uploadedTopicContent?: string; // New field for uploaded context/material
}

export interface QuestionPart {
  label: string; // a., b., -, +
  content: string;
  points?: string;
}

export interface Question {
  id: string; // Câu 1
  text: string;
  points: number;
  parts?: QuestionPart[];
  level?: string; 
}

export interface ExamSection {
  section: string; // "I. Đọc hiểu" or "II. Làm văn"
  text?: string;
  source?: string;
  questions: Question[];
}

export interface AnswerKey {
  questionId: string;
  answer: string;
  pointsDetail: string;
}

export interface ExamData {
  examTitle: string;
  duration: string;
  content: ExamSection[];
  answers: AnswerKey[];
  matrixMapping?: string[];
}

export enum AppView {
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
}