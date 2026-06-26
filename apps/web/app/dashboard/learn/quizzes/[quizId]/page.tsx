"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, ChevronRight, HelpCircle, ArrowLeft, Trophy } from "lucide-react"
import { toast } from "sonner"

export default function StudentQuizPage() {
  const { quizId } = useParams()
  const router = useRouter()
  
  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const [mockUserId, setMockUserId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch mock user ID for testing
    fetch('http://localhost:4000/api/v1/auth/me')
      .then(res => res.json())
      .catch(() => {
        fetch('http://localhost:4000/api/v1/lms/assignments/mock-context')
          .then(res => res.json())
          .then(data => {
            if (data.studentId) setMockUserId(data.studentId)
          })
      })

    fetch(`http://localhost:4000/api/v1/lms/quizzes/${quizId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setQuiz(data.data)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [quizId])

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (result) return // Disable changing answers after submission
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = async () => {
    if (!mockUserId) return toast.error("User not authenticated")
    if (Object.keys(answers).length < quiz.questions.length) {
      return toast.error("Please answer all questions before submitting.")
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/lms/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: mockUserId,
          answers
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        if (data.passed) {
          toast.success(`Quiz passed! +${data.earnedXp} XP`)
        } else {
          toast.error("You did not pass the quiz. Try again.")
        }
      }
    } catch (e) {
      toast.error("Failed to submit quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><div className="animate-pulse w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
  }

  if (!quiz) {
    return <div className="p-8 text-center text-slate-500">Quiz not found.</div>
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] overflow-y-auto font-sans selection:bg-[#CCF0FA] pb-24">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/dashboard/learn" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-4">{quiz.title}</h1>
          <p className="text-slate-500 max-w-xl mx-auto">{quiz.description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 mt-6 shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#49ABC9]" /> {quiz.questions.length} Questions
            <span className="w-1 h-1 bg-slate-300 rounded-full mx-2" />
            Passing Score: {quiz.passingScore}%
          </div>
        </div>

        {result && (
          <div className={`mb-12 p-8 rounded-3xl border text-center ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {result.passed ? <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" /> : <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />}
            <h2 className={`text-3xl font-black mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
              {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h2>
            <p className={`text-lg font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              Your Score: {result.score}%
            </p>
            {result.passed && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 font-bold px-4 py-2 rounded-full text-sm">
                +{result.earnedXp} XP Awarded
              </div>
            )}
            {!result.passed && (
              <button onClick={() => { setResult(null); setAnswers({}); }} className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                Retake Quiz
              </button>
            )}
          </div>
        )}

        <div className="space-y-12">
          {quiz.questions.map((q: any, index: number) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCorrect = isAnswered && answers[q.id] === q.correctOption;
            const showExplanation = result !== null;

            return (
              <div key={q.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                {showExplanation && (
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                )}
                
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  <span className="text-slate-400 mr-2">{index + 1}.</span> {q.questionText}
                </h3>
                
                <div className="space-y-3">
                  {q.options.map((opt: string, optIndex: number) => {
                    const isSelected = answers[q.id] === optIndex;
                    let optionClasses = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex items-center gap-4 "
                    
                    if (result) {
                      if (optIndex === q.correctOption) {
                        optionClasses += "border-green-500 bg-green-50 text-green-800"
                      } else if (isSelected) {
                        optionClasses += "border-red-500 bg-red-50 text-red-800"
                      } else {
                        optionClasses += "border-slate-100 bg-slate-50 text-slate-400 opacity-50"
                      }
                    } else {
                      if (isSelected) {
                        optionClasses += "border-[#49ABC9] bg-[#E5F4F8] text-[#49ABC9]"
                      } else {
                        optionClasses += "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      }
                    }

                    return (
                      <button 
                        key={optIndex}
                        onClick={() => handleOptionSelect(q.id, optIndex)}
                        disabled={result !== null}
                        className={optionClasses}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          result 
                            ? (optIndex === q.correctOption ? 'border-green-500 bg-green-500' : (isSelected ? 'border-red-500 bg-red-500' : 'border-slate-300'))
                            : (isSelected ? 'border-[#49ABC9] bg-[#49ABC9]' : 'border-slate-300')
                        }`}>
                          {result && optIndex === q.correctOption && <CheckCircle2 className="w-4 h-4 text-white" />}
                          {result && isSelected && optIndex !== q.correctOption && <XCircle className="w-4 h-4 text-white" />}
                          {!result && isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {showExplanation && q.explanation && (
                  <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <span className="font-bold uppercase tracking-wider text-xs opacity-50 block mb-1">Explanation</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!result && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
              className="px-8 py-4 bg-[#49ABC9] text-white text-lg font-bold rounded-2xl hover:bg-[#398FA8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(73,171,201,0.3)] inline-flex items-center gap-2"
            >
              {isSubmitting ? 'Grading Quiz...' : 'Submit Quiz'} <ChevronRight className="w-5 h-5" />
            </button>
            {Object.keys(answers).length < quiz.questions.length && (
              <p className="text-sm text-slate-500 mt-4">Please answer all {quiz.questions.length} questions to submit.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
