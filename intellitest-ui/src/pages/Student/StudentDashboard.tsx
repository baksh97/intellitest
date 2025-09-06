import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/api';
import { Test, Submission } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

export function StudentDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, submissionsData] = await Promise.all([
          apiClient.get<Test[]>(API_ENDPOINTS.TESTS, { is_live: 'true' }),
          apiClient.get<Submission[]>(API_ENDPOINTS.MY_SUBMISSIONS)
        ]);
        setTests(testsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getTestStatus = (test: Test) => {
    const submission = submissions.find(s => s.test_id === test.id);
    if (submission) return 'completed';
    return 'available';
  };

  const availableTests = tests.filter(test => 
    test.assigned_classes.split(',').some(cls => cls.trim() === user?.class_name)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-blue-100">Class: {user?.class_name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Tests</p>
              <p className="text-2xl font-bold text-gray-900">{availableTests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {availableTests.length - submissions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Tests</h2>
        </div>
        
        <div className="p-6">
          {availableTests.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tests available at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableTests.map((test) => {
                const status = getTestStatus(test);
                return (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {test.duration_minutes} minutes
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {status === 'completed' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      ) : (
                        <Link
                          to={`/test/${test.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Start Test
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}