import React, { useState, useEffect } from 'react';
import { Monitor, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/api';
import { Test, TestProgress } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

export function LiveMonitoring() {
  const [liveTests, setLiveTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [progress, setProgress] = useState<TestProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLiveTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchTestProgress(selectedTest.id);
      const interval = setInterval(() => {
        fetchTestProgress(selectedTest.id, true);
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedTest]);

  const fetchLiveTests = async () => {
    try {
      const data = await apiClient.get<Test[]>(API_ENDPOINTS.LIVE_TESTS);
      setLiveTests(data);
      if (data.length > 0 && !selectedTest) {
        setSelectedTest(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch live tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestProgress = async (testId: number, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const data = await apiClient.get<TestProgress[]>(API_ENDPOINTS.TEST_PROGRESS(testId));
      // Ensure data is always an array
      setProgress(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch test progress:', error);
      // Set empty array on error to prevent filter issues
      setProgress([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (liveTests.length === 0) {
    return (
      <div className="text-center py-8">
        <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Live Tests</h2>
        <p className="text-gray-600">There are no live tests to monitor at the moment.</p>
      </div>
    );
  }

  const completedCount = Array.isArray(progress) ? progress.filter(p => p.status === 'submitted').length : 0;
  const inProgressCount = Array.isArray(progress) ? progress.filter(p => p.status === 'in_progress').length : 0;
  const notStartedCount = Array.isArray(progress) ? progress.filter(p => p.status === 'not_started').length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Live Test Monitoring</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {refreshing && <LoadingSpinner size="sm" />}
          <span>Auto-refresh every 5s</span>
        </div>
      </div>

      {/* Test Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Test to Monitor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveTests.map((test) => (
            <button
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedTest?.id === test.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {test.duration_minutes} minutes
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTest && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(progress) ? progress.length : 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-gray-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Not Started</p>
                  <p className="text-2xl font-bold text-gray-900">{notStartedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Progress Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Student Progress</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(progress) ? progress.map((student) => (
                    <tr key={student.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.user_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{student.class_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {student.attempted_questions}/{student.total_questions}
                          </div>
                          <div className="ml-4 w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(student.attempted_questions / student.total_questions) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(student.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                            {student.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No progress data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}