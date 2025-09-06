import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/api';
import { Test, TestAnswer } from '../../types';
import { Timer } from '../../components/Common/Timer';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

export function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      
      try {
        const testData = await apiClient.get<Test>(`${API_ENDPOINTS.TESTS}/${testId}`);
        setTest(testData);
      } catch (error) {
        console.error('Failed to fetch test:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, navigate]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!test) return;

    setSubmitting(true);
    try {
      const testAnswers: TestAnswer[] = (test.questions || []).map(question => ({
        question_id: question.id,
        selected_answer: (answers[question.id] as 'a' | 'b' | 'c' | 'd') || null
      }));

      await apiClient.post(API_ENDPOINTS.SUBMISSIONS, {
        test_id: test.id,
        answers: testAnswers
      });

      navigate('/results');
    } catch (error) {
      console.error('Failed to submit test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Test not found</p>
      </div>
    );
  }

  const attemptedQuestions = Object.keys(answers).length;
  const totalQuestions = test.questions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Test Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-gray-600 mt-1">{test.description}</p>
          </div>
          
          <div className="text-right">
            {testStarted && (
              <Timer
                durationMinutes={test.duration_minutes}
                onTimeUp={handleTimeUp}
                isActive={true}
              />
            )}
            {!testStarted && (
              <button
                onClick={() => setTestStarted(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start Test
              </button>
            )}
          </div>
        </div>
      </div>

      {testStarted && (
        <>
          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Progress: {attemptedQuestions} of {totalQuestions} questions attempted
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(attemptedQuestions / totalQuestions) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((attemptedQuestions / totalQuestions) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-8">
                {test.questions?.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700">{question.question_text}</p>
                      {question.image_url && (
                        <img
                          src={question.image_url}
                          alt="Question diagram"
                          className="mt-3 max-w-md rounded-lg border border-gray-200"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'a', text: question.option_a },
                        { key: 'b', text: question.option_b },
                        { key: 'c', text: question.option_c },
                        { key: 'd', text: question.option_d }
                      ].map(option => (
                        <label
                          key={option.key}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            answers[question.id] === option.key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.key}
                            checked={answers[question.id] === option.key}
                            onChange={() => handleAnswerChange(question.id, option.key)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            answers[question.id] === option.key
                              ? 'border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {answers[question.id] === option.key && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <span className="font-medium text-gray-700 mr-2">
                            {option.key.toUpperCase()}.
                          </span>
                          <span className="text-gray-700">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {attemptedQuestions < totalQuestions && (
                  <div className="flex items-center text-orange-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    You have unanswered questions
                  </div>
                )}
                {attemptedQuestions === totalQuestions && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    All questions answered
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                Submit Test
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-6">
              You have attempted {attemptedQuestions} out of {totalQuestions} questions. 
              Once submitted, you cannot change your answers. Are you sure you want to submit?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}