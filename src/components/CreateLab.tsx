import React, { useState, useEffect } from 'react';
import { Save, Plus, X, BookOpen, Clock, Target, CheckCircle, ExternalLink } from 'lucide-react';
import { Course } from '../types';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';

const CreateLab: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLab, setCreatedLab] = useState<{ title: string; id: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    category: 'AI/ML' as const,
    level: 'Beginner' as const,
    type: 'course' as const,
    duration: 60,
    instructions: '',
    resources: [''],
    tags: [''],
    codespacesUrl: '',
    expirationHours: 40,
    prerequisites: [''],
    certificationCriteria: {
      passingScore: 80,
      maxAttempts: 3,
      timeLimit: 120
    },
    projectDeliverables: [''],
    estimatedEffort: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await mockApi.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  const handleArrayChange = (index: number, value: string, field: 'resources' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'resources' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'resources' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        resources: formData.resources.filter(r => r.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
        prerequisites: formData.prerequisites.filter(p => p.trim() !== ''),
        projectDeliverables: formData.type === 'project' 
          ? formData.projectDeliverables.filter(d => d.trim() !== '')
          : undefined,
        certificationCriteria: formData.type === 'certification' 
          ? formData.certificationCriteria
          : undefined,
        estimatedEffort: formData.type === 'project' && formData.estimatedEffort.trim() 
          ? formData.estimatedEffort 
          : undefined,
        creatorId: user.id,
        isActive: true
      };

      const newLab = await mockApi.createLab(cleanedData);
      
      // Show modern success modal
      setCreatedLab({ title: newLab.title, id: newLab.id });
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        courseId: '',
        category: 'AI/ML',
        level: 'Beginner',
        type: 'course',
        duration: 60,
        instructions: '',
        resources: [''],
        tags: [''],
        codespacesUrl: '',
        expirationHours: 40,
        prerequisites: [''],
        certificationCriteria: {
          passingScore: 80,
          maxAttempts: 3,
          timeLimit: 120
        },
        projectDeliverables: [''],
        estimatedEffort: ''
      });

    } catch (error) {
      console.error('Failed to create lab:', error);
      alert('Failed to create lab. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['AI/ML', 'Data Science', 'Python', 'Web Development', 'DevOps'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const types = [
    { id: 'course', label: 'Course', description: 'Structured learning with lessons and exercises' },
    { id: 'certification', label: 'Certification', description: 'Assessment-based credential earning' },
    { id: 'project', label: 'Project', description: 'Real-world application and portfolio building' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="card-modern p-8">
        <div className="flex items-center mb-6">
          <div className="category-icon bg-gradient-to-r from-indigo-500 to-purple-600 mr-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-gradient mb-2">Create AI-Powered Lab</h1>
            <p className="text-gray-600 text-lg leading-relaxed">Build innovative hands-on learning experiences with cutting-edge AI technology</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card-modern p-8">
          <h2 className="section-header">
            <Target size={24} className="mr-3 text-indigo-600" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <label htmlFor="title" className="form-label">
                Lab Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input text-lg"
                placeholder="e.g., Machine Learning Basics with Python"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="form-textarea"
                placeholder="Describe what students will learn and accomplish in this lab"
                required
              />
            </div>

            <div>
              <label htmlFor="courseId" className="form-label">
                Course
              </label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select a course (optional)</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="form-label">
                Lab Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="form-label">
                Difficulty Level *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="form-label">
                Duration (minutes) *
              </label>
              <div className="relative">
                <Clock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  className="form-input pl-12"
                  placeholder="60"
                  required
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="codespacesUrl" className="form-label">
                Lab Environment URL (GitHub Codespaces)
              </label>
              <input
                type="url"
                id="codespacesUrl"
                name="codespacesUrl"
                value={formData.codespacesUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://your-codespace-url.github.dev/"
              />
              <p className="text-sm text-gray-500 mt-2">
                Optional: Provide a GitHub Codespaces URL for the lab environment. If not provided, a default environment will be used.
              </p>
            </div>

            <div>
              <label htmlFor="expirationHours" className="form-label">
                Lab Expiration (hours) *
              </label>
              <div className="relative">
                <Clock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="number"
                  id="expirationHours"
                  name="expirationHours"
                  value={formData.expirationHours}
                  onChange={handleInputChange}
                  min="1"
                  max="168"
                  className="form-input pl-12"
                  placeholder="40"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Hours after allocation when the lab will automatically expire and become overdue (1-168 hours).
              </p>
            </div>

            {formData.type === 'project' && (
              <div>
                <label htmlFor="estimatedEffort" className="form-label">
                  Estimated Effort
                </label>
                <input
                  type="text"
                  id="estimatedEffort"
                  name="estimatedEffort"
                  value={formData.estimatedEffort}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 2-3 weeks, 40 hours"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Estimated time commitment for project completion.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Content */}
        <div className="card-modern p-8">
          <h2 className="section-header">
            <BookOpen size={24} className="mr-3 text-indigo-600" />
            Lab Content
          </h2>
          <div>
            <label htmlFor="instructions" className="form-label">
              Instructions *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows={10}
              className="form-textarea"
              placeholder="Provide detailed step-by-step instructions for the lab..."
              required
            />
          </div>
        </div>

        {/* Resources */}
        <div className="card-modern p-8">
          <h2 className="section-header">
            <BookOpen size={24} className="mr-3 text-indigo-600" />
            {formData.type === 'project' ? 'Project Resources' : 'Learning Resources'}
          </h2>
          <div className="space-y-3">
            {formData.resources.map((resource, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={resource}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'resources')}
                  className="form-input flex-1"
                  placeholder={
                    formData.type === 'project' 
                      ? "e.g., GitHub repository template, API documentation"
                      : formData.type === 'certification'
                      ? "e.g., Study guide, practice tests"
                      : "e.g., Dataset: housing_prices.csv"
                  }
                />
                {formData.resources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'resources')}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('resources')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={16} className="mr-1" />
              Add Resource
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="card-modern p-8">
          <h2 className="section-header">
            <Target size={24} className="mr-3 text-indigo-600" />
            Tags & Keywords
          </h2>
          <div className="space-y-3">
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                  className="form-input flex-1"
                  placeholder="e.g., machine-learning"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'tags')}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tags')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={16} className="mr-1" />
              Add Tag
            </button>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="card-modern p-8">
          <h2 className="section-header">
            <CheckCircle size={24} className="mr-3 text-indigo-600" />
            Prerequisites
          </h2>
          <div className="space-y-3">
            {formData.prerequisites.map((prerequisite, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={prerequisite}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'prerequisites')}
                  className="form-input flex-1"
                  placeholder={
                    formData.type === 'certification'
                      ? "e.g., Complete Python Basics course"
                      : formData.type === 'project'
                      ? "e.g., Knowledge of React and Node.js"
                      : "e.g., Basic programming knowledge"
                  }
                />
                {formData.prerequisites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'prerequisites')}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('prerequisites')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={16} className="mr-1" />
              Add Prerequisite
            </button>
          </div>
        </div>

        {/* Certification Criteria */}
        {formData.type === 'certification' && (
          <div className="card-modern p-8">
            <h2 className="section-header">
              <Target size={24} className="mr-3 text-indigo-600" />
              Certification Criteria
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="form-label">
                  Passing Score (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.certificationCriteria.passingScore}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    certificationCriteria: {
                      ...prev.certificationCriteria,
                      passingScore: parseInt(e.target.value) || 80
                    }
                  }))}
                  className="form-input"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="form-label">
                  Max Attempts *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.certificationCriteria.maxAttempts}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    certificationCriteria: {
                      ...prev.certificationCriteria,
                      maxAttempts: parseInt(e.target.value) || 3
                    }
                  }))}
                  className="form-input"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="form-label">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={formData.certificationCriteria.timeLimit || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    certificationCriteria: {
                      ...prev.certificationCriteria,
                      timeLimit: parseInt(e.target.value) || undefined
                    }
                  }))}
                  className="form-input"
                  placeholder="120"
                />
              </div>
            </div>
          </div>
        )}

        {/* Project Deliverables */}
        {formData.type === 'project' && (
          <div className="card-modern p-8">
            <h2 className="section-header">
              <CheckCircle size={24} className="mr-3 text-indigo-600" />
              Project Deliverables
            </h2>
            <div className="space-y-3">
              {formData.projectDeliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={deliverable}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'projectDeliverables')}
                    className="form-input flex-1"
                    placeholder="e.g., Working web application with user authentication"
                  />
                  {formData.projectDeliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'projectDeliverables')}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('projectDeliverables')}
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Plus size={16} className="mr-1" />
                Add Deliverable
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="card-modern p-8">
          <div className="flex justify-end space-x-6">
            <button
              type="button"
              className="btn-secondary"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex items-center ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-3"></div>
                  Creating Lab...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-3" />
                  Create Lab
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && createdLab && (
        <SuccessModal
          labTitle={createdLab.title}
          labId={createdLab.id}
          onClose={() => {
            setShowSuccessModal(false);
            setCreatedLab(null);
          }}
        />
      )}
    </div>
  );
};

// Success Modal Component
const SuccessModal: React.FC<{
  labTitle: string;
  labId: string;
  onClose: () => void;
}> = ({ labTitle, labId, onClose }) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-enter">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <CheckCircle size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Lab Created Successfully!
          </h2>
          <p className="text-green-100 text-center">
            Your AI-powered lab is ready for students
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="category-icon category-ai flex-shrink-0 mt-1">
                <BookOpen size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {labTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  Lab ID: <span className="font-mono text-xs">{labId}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
              <span>Lab saved to storage and catalog</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
              <span>Available in Lab Catalog for students</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
              <span>Ready for lab allocations</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <ExternalLink size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  What's Next?
                </h4>
                <p className="text-blue-800 text-sm">
                  Your lab is now live! Students can access it through the Lab Catalog, 
                  and admins can assign it to specific users.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary text-sm py-2 px-4"
            >
              Create Another Lab
            </button>
            <button
              onClick={onClose}
              className="btn-primary text-sm py-2 px-4"
            >
              View Lab Catalog
            </button>
          </div>
        </div>

        {/* Auto-close indicator */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-400 text-center">
            This modal will close automatically in 5 seconds
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-1 rounded-full animate-pulse"
              style={{ 
                width: '100%',
                animation: 'shrink 5s linear forwards'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLab;