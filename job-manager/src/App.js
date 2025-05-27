import React, { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle, XCircle, Loader, Trash2, Zap, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

// API functions (replace with your actual backend)
const api = {
  createJob: async (inputData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job = {
      job_id: jobId,
      run_id: runId,
      status: 'pending',
      input_data: inputData,
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      result: null,
      error: null
    };
    
    // Store in localStorage (simulating Firebase)
    const jobs = JSON.parse(localStorage.getItem('jobs') || '{}');
    jobs[jobId] = job;
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    // Start mock job execution
    setTimeout(() => api.executeJob(jobId), 1000);
    
    return { job_id: jobId };
  },
  
  executeJob: async (jobId) => {
    const jobs = JSON.parse(localStorage.getItem('jobs') || '{}');
    const job = jobs[jobId];
    
    if (!job) return;
    
    // Update to running
    job.status = 'running';
    job.started_at = new Date().toISOString();
    jobs[jobId] = job;
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    // Simulate job execution (3-8 seconds)
    const executionTime = 3000 + Math.random() * 5000;
    
    setTimeout(() => {
      // Simulate 85% success rate
      const success = Math.random() > 0.15;
      
      if (success) {
        job.status = 'completed';
        job.result = {
          message: 'Job completed successfully',
          processed_input1: job.input_data.input1,
          processed_input2: job.input_data.input2,
          combined_result: `${job.input_data.input1} + ${job.input_data.input2}`,
          computation_time: executionTime
        };
      } else {
        job.status = 'failed';
        job.error = 'Network timeout during processing';
      }
      
      job.completed_at = new Date().toISOString();
      jobs[jobId] = job;
      localStorage.setItem('jobs', JSON.stringify(jobs));
    }, executionTime);
  },
  
  listJobs: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const jobs = JSON.parse(localStorage.getItem('jobs') || '{}');
    return Object.values(jobs).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  deleteJob: async (jobId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const jobs = JSON.parse(localStorage.getItem('jobs') || '{}');
    delete jobs[jobId];
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }
};

// Validation function
const validateInputs = (input1, input2) => {
  const errors = {};
  
  if (!input1 || input1.trim().length === 0) {
    errors.input1 = 'input1 is required and cannot be empty';
  }
  
  if (input2 === '' || input2 === null || input2 === undefined) {
    errors.input2 = 'input2 is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { 
      icon: Clock, 
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      pulse: false
    },
    running: { 
      icon: Loader, 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      pulse: true
    },
    completed: { 
      icon: CheckCircle, 
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pulse: false
    },
    failed: { 
      icon: XCircle, 
      color: 'bg-red-100 text-red-800 border-red-200',
      pulse: false
    }
  };
  
  const config = configs[status];
  const IconComponent = config.icon;
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <IconComponent className={`w-4 h-4 mr-2 ${config.pulse ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

const JobCard = ({ job, onDelete }) => {
  const getRuntime = () => {
    if (!job.started_at) return null;
    
    const start = new Date(job.started_at);
    const end = job.completed_at ? new Date(job.completed_at) : new Date();
    const runtime = Math.round((end - start) / 1000);
    
    return `${runtime}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Job #{job.job_id.split('_')[1].slice(0, 8)}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(job.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={job.status} />
            <button
              onClick={() => onDelete(job.job_id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-600 mb-2">INPUT DATA</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-500">input1:</span>
                <div className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                  "{job.input_data.input1}"
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">input2:</span>
                <div className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                  {JSON.stringify(job.input_data.input2)}
                </div>
              </div>
            </div>
          </div>
          
          {getRuntime() && (
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Runtime:</span>
              <span className="font-medium text-gray-900">{getRuntime()}</span>
            </div>
          )}
          
          {job.result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="text-xs font-medium text-emerald-700 mb-2">RESULT</div>
              <div className="font-mono text-sm text-emerald-800">
                {job.result.combined_result}
              </div>
            </div>
          )}
          
          {job.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-xs font-medium text-red-700 mb-2">ERROR</div>
              <div className="text-sm text-red-800">
                {job.error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-200', '-100')}`}>
        <Icon className={`w-6 h-6 ${color.replace('border-', 'text-').replace('-200', '-600')}`} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center mt-3 text-sm">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-green-600">{trend}</span>
      </div>
    )}
  </div>
);

export default function AsyncJobManager() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [jobs, setJobs] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadJobs = async () => {
    try {
      const jobList = await api.listJobs();
      setJobs(jobList);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  useEffect(() => {
    loadJobs();
    
    // Auto-refresh every 2 seconds
    const interval = setInterval(loadJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    // Validate inputs
    const validation = validateInputs(input1, input2);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      await api.createJob({
        input1: input1.trim(),
        input2: input2
      });
      
      // Clear form
      setInput1('');
      setInput2('');
      
      // Refresh job list
      setTimeout(loadJobs, 500);
      
    } catch (error) {
      setErrors({ submit: 'Failed to create job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await api.deleteJob(jobId);
      await loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const clearAllJobs = () => {
    localStorage.removeItem('jobs');
    setJobs([]);
  };

  const stats = {
    total: jobs.length,
    running: jobs.filter(job => job.status === 'running').length,
    completed: jobs.filter(job => job.status === 'completed').length,
    failed: jobs.filter(job => job.status === 'failed').length
  };

  const successRate = stats.total > 0 ? Math.round((stats.completed / (stats.completed + stats.failed)) * 100) || 0 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Manager</h1>
                <p className="text-sm text-gray-500">Async job processing dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              {jobs.length > 0 && (
                <button
                  onClick={clearAllJobs}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Activity} 
            label="Total Jobs" 
            value={stats.total} 
            color="border-blue-200"
          />
          <StatCard 
            icon={Loader} 
            label="Running" 
            value={stats.running} 
            color="border-amber-200"
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completed" 
            value={stats.completed} 
            color="border-emerald-200"
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Success Rate" 
            value={`${successRate}%`} 
            color="border-purple-200"
            trend={successRate >= 80 ? "Good performance" : "Needs attention"}
          />
        </div>
        
        {/* Create Job Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Job</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.input1 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter a string value..."
                />
                {errors.input1 && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.input1}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input 2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.input2 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter any value..."
                />
                {errors.input2 && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.input2}
                  </p>
                )}
              </div>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Creating Job...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span className="font-medium">Create Job</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Jobs List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Jobs ({jobs.length})
            </h2>
            {stats.running > 0 && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{stats.running} job{stats.running !== 1 ? 's' : ''} running</span>
              </div>
            )}
          </div>
          
          {jobs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
              <p className="text-gray-500 mb-4">Create your first job to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}