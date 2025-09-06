import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Eye } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/api';
import { Question } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

export function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a' as 'a' | 'b' | 'c' | 'd',
    topic: '',
    difficulty_level: 'easy' as 'easy' | 'medium' | 'hard',
    image_url: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await apiClient.get<Question[]>(API_ENDPOINTS.QUESTIONS, {
        skip: '0',
        limit: '100'
      });
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await apiClient.put(`${API_ENDPOINTS.QUESTIONS}/${editingQuestion.id}`, formData);
      } else {
        await apiClient.post(API_ENDPOINTS.QUESTIONS, formData);
      }
      
      fetchQuestions();
      resetForm();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await apiClient.delete(`${API_ENDPOINTS.QUESTIONS}/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
      topic: '',
      difficulty_level: 'easy',
      image_url: ''
    });
    setShowCreateModal(false);
    setEditingQuestion(null);
  };

  const startEdit = (question: Question) => {
    setFormData({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      topic: question.topic,
      difficulty_level: question.difficulty_level,
      image_url: question.image_url || ''
    });
    setEditingQuestion(question);
    setShowCreateModal(true);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !topicFilter || question.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });

  const uniqueTopics = [...new Set(questions.map(q => q.topic))];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Topics</option>
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions ({filteredQuestions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{question.question_text}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty_level)}`}>
                      {question.difficulty_level}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Topic:</span> {question.topic}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className={`p-2 rounded border ${question.correct_answer === 'a' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-medium">A.</span> {question.option_a}
                    </div>
                    <div className={`p-2 rounded border ${question.correct_answer === 'b' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-medium">B.</span> {question.option_b}
                    </div>
                    <div className={`p-2 rounded border ${question.correct_answer === 'c' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-medium">C.</span> {question.option_c}
                    </div>
                    <div className={`p-2 rounded border ${question.correct_answer === 'd' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="font-medium">D.</span> {question.option_d}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(question)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option A
                  </label>
                  <input
                    type="text"
                    value={formData.option_a}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_a: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option B
                  </label>
                  <input
                    type="text"
                    value={formData.option_b}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_b: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option C
                  </label>
                  <input
                    type="text"
                    value={formData.option_c}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_c: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option D
                  </label>
                  <input
                    type="text"
                    value={formData.option_d}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_d: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    value={formData.correct_answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value as 'a' | 'b' | 'c' | 'd' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value as 'easy' | 'medium' | 'hard' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}