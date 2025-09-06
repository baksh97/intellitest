import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Edit3, Trash2, Clock, Users } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/api';
import { Test, Question } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

export function TestManagement() {
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    assigned_classes: '',
    question_ids: [] as number[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsData, questionsData] = await Promise.all([
        apiClient.get<Test[]>(API_ENDPOINTS.TESTS),
        apiClient.get<Question[]>(API_ENDPOINTS.QUESTIONS, { limit: '1000' })
      ]);
      setTests(testsData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await apiClient.put(`${API_ENDPOINTS.TESTS}/${editingTest.id}`, formData);
      } else {
        await apiClient.post(API_ENDPOINTS.TESTS, formData);
      }
      
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save test:', error);
    }
  };

  const toggleLiveStatus = async (test: Test) => {
    try {
      await apiClient.put(`${API_ENDPOINTS.TESTS}/${test.id}`, {
        is_live: !test.is_live
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this test?')) {
      try {
        await apiClient.delete(`${API_ENDPOINTS.TESTS}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete test:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      assigned_classes: '',
      question_ids: []
    });
    setShowCreateModal(false);
    setEditingTest(null);
  };

  const startEdit = (test: Test) => {
    setFormData({
      name: test.name,
      description: test.description,
      duration_minutes: test.duration_minutes,
      assigned_classes: test.assigned_classes,
      question_ids: test.questions?.map(q => q.id) || []
    });
    setEditingTest(test);
    setShowCreateModal(true);
  };

  const toggleQuestionSelection = (questionId: number) => {
    setFormData(prev => ({
      ...prev,
      question_ids: prev.question_ids.includes(questionId)
        ? prev.question_ids.filter(id => id !== questionId)
        : [...prev.question_ids, questionId]
    }));
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
        <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => startEdit(test)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {test.duration_minutes} minutes
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {test.assigned_classes}
              </div>
              <div>
                <span className="font-medium">Questions:</span> {test.questions?.length || 0}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                test.is_live 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {test.is_live ? 'Live' : 'Draft'}
              </span>
              
              <button
                onClick={() => toggleLiveStatus(test)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  test.is_live
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {test.is_live ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Go Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTest ? 'Edit Test' : 'Create New Test'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Classes (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.assigned_classes}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigned_classes: e.target.value }))}
                  placeholder="Class 10A, Class 10B"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Questions ({formData.question_ids.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {questions.map((question) => (
                    <label
                      key={question.id}
                      className="flex items-start p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.question_ids.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {question.question_text}
                        </div>
                        <div className="text-xs text-gray-500">
                          Topic: {question.topic} • Difficulty: {question.difficulty_level}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
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
                  {editingTest ? 'Update Test' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}