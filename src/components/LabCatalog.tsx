import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, BookOpen, Clock, User, Star, Play, Code, Edit, X, Plus, Save, Target, CheckCircle, Check, ArrowLeft } from 'lucide-react';
import { Lab, LabAllocation } from '../types';
import { mockApi } from '../services/mockApi';
import { LabStorageService } from '../services/labStorage';
import { useAuth } from '../contexts/AuthContext';
import LabEnvironment from './LabEnvironment';
import CodeEditor from './CodeEditor';

const LabCatalog: React.FC = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [allocations, setAllocations] = useState<LabAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLab, setSelectedLab] = useState<{ title: string; url: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeEditorLab, setCodeEditorLab] = useState<Lab | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, allocationsData] = await Promise.all([
          mockApi.getLabs(),
          user?.role === 'student' ? mockApi.getAllocationsByUser(user.id) : mockApi.getLabAllocations()
        ]);
        setLabs(labsData);
        setAllocations(allocationsData);
      } catch (error) {
        console.error('Failed to fetch catalog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleStartLab = (labUrl: string) => {
    if (labUrl) {
      window.location.href = labUrl;
    } else {
      // Default lab environment if no specific URL
      window.location.href = 'https://congenial-spork-jq4xg4pqqrf57g.github.dev/';
    }
  };

  const handleEditLab = (lab: Lab) => {
    setEditingLab(lab);
    setShowEditModal(true);
  };

  const handleOpenCodeEditor = (lab: Lab) => {
    setCodeEditorLab(lab);
    setShowCodeEditor(true);
  };

  const handleBackToCatalog = () => {
    setShowCodeEditor(false);
    setCodeEditorLab(null);
  };

  const getLabStatus = (lab: Lab) => {
    if (user?.role === 'student') {
      const allocation = allocations.find(a => a.labId === lab.id && a.userId === user.id);
      if (allocation) {
        return {
          status: allocation.status,
          dueDate: allocation.dueDate,
          progress: allocation.status === 'completed' ? 100 : allocation.status === 'in-progress' ? 65 : 0
        };
      }
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'level-beginner';
      case 'Intermediate': return 'level-intermediate';
      case 'Advanced': return 'level-advanced';
      default: return 'level-beginner';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI/ML': return 'category-ai';
      case 'Data Science': return 'category-data';
      case 'Python': return 'category-python';
      case 'Web Development': return 'category-web';
      case 'DevOps': return 'category-devops';
      default: return 'category-ai';
    }
  };

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || lab.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || lab.level === levelFilter;
    const matchesType = typeFilter === 'all' || lab.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesType && lab.isActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If showing code editor, render it directly
  if (showCodeEditor && codeEditorLab) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header with back button */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToCatalog}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Lab Catalog
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Code size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{codeEditorLab.title}</h2>
                <p className="text-sm text-gray-600">Interactive Code Editor</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-modern p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold heading-gradient mb-4">
              {user?.role === 'student' ? 'My AI Labs' : 'AI Lab Catalog'}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {user?.role === 'student' 
                ? 'Access your assigned labs and continue your AI learning journey'
                : 'Explore cutting-edge AI labs and hands-on learning experiences'
              }
            </p>
          </div>
          <div className="mt-6 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-modern p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search labs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Data Science">Data Science</option>
              <option value="Python">Python</option>
              <option value="Web Development">Web Development</option>
              <option value="DevOps">DevOps</option>
            </select>
            
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="course">Course</option>
              <option value="certification">Certification</option>
              <option value="project">Project</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredLabs.length} of {labs.length} labs
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Available
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              In Progress
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Labs Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLabs.map(lab => {
            const labStatus = getLabStatus(lab);
            return (
              <div key={lab.id} className="card-modern overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`category-icon ${getCategoryIcon(lab.category)} mr-4 flex-shrink-0`}>
                      <BookOpen size={20} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`level-badge ${getLevelColor(lab.level)}`}>
                        {lab.level}
                      </span>
                      {labStatus && (
                        <span className={`status-badge ${getStatusColor(labStatus.status)}`}>
                          {labStatus.status.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {lab.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {lab.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock size={16} className="mr-2" />
                    <span>{lab.duration} minutes</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{lab.type}</span>
                    {lab.expirationHours && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Expires in {lab.expirationHours}h</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {lab.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                    {lab.tags.length > 3 && (
                      <span className="tag">
                        +{lab.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  {labStatus?.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{labStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${labStatus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 pb-6 space-y-3">
                  {user?.role === 'creator' && (
                    <button
                      onClick={() => handleEditLab(lab)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center mb-3"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Lab
                    </button>
                  )}
                  
                  {lab.type === 'course' ? (
                    <button
                      onClick={() => handleOpenCodeEditor(lab)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center font-semibold"
                    >
                      <Code size={20} className="mr-2" />
                      {labStatus?.status === 'completed' ? 'Review Lab' : 
                       labStatus?.status === 'in-progress' ? 'Continue Lab' : 
                       'Open Code Editor'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedLab({
                        title: lab.title,
                        url: lab.codespacesUrl || 'https://congenial-spork-jq4xg4pqqrf57g.github.dev/'
                      })}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-semibold"
                    >
                      <Play size={20} className="mr-2" />
                      {labStatus?.status === 'completed' ? 'Review Lab' : 
                       labStatus?.status === 'in-progress' ? 'Continue Lab' : 
                       'Start Lab'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-modern">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Lab
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  {user?.role === 'student' && (
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredLabs.map(lab => {
                  const labStatus = getLabStatus(lab);
                  return (
                    <tr key={lab.id} className="table-row">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className={`category-icon ${getCategoryIcon(lab.category)} mr-4 flex-shrink-0`}>
                            <BookOpen size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {lab.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {lab.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {lab.tags.slice(0, 4).map(tag => (
                                <span key={tag} className="tag text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {lab.category}
                        </span>
                        <div className="text-xs text-gray-500 capitalize mt-1">
                          {lab.type}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`level-badge ${getLevelColor(lab.level)}`}>
                          {lab.level}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock size={16} className="mr-2" />
                          <span>{lab.duration}m</span>
                        </div>
                        {lab.expirationHours && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {lab.expirationHours}h
                          </div>
                        )}
                      </td>
                      {user?.role === 'student' && (
                        <td className="px-8 py-6 whitespace-nowrap">
                          {labStatus ? (
                            <div>
                              <span className={`status-badge ${getStatusColor(labStatus.status)}`}>
                                {labStatus.status.replace('-', ' ')}
                              </span>
                              {labStatus.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full"
                                      style={{ width: `${labStatus.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {labStatus.progress}%
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not assigned</span>
                          )}
                        </td>
                      )}
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="space-y-2">
                          {user?.role === 'creator' && (
                            <button
                              onClick={() => handleEditLab(lab)}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all duration-200 block"
                            >
                              <Edit size={14} className="mr-1 inline" />
                              Edit
                            </button>
                          )}
                          
                          {lab.type === 'course' ? (
                            <button
                              onClick={() => handleOpenCodeEditor(lab)}
                              className="text-purple-600 hover:text-purple-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-purple-50 transition-all duration-200"
                            >
                              <Code size={14} className="mr-1 inline" />
                              {labStatus?.status === 'completed' ? 'Review' :
                               labStatus?.status === 'in-progress' ? 'Continue' :
                               'Open Code Editor'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedLab({
                                title: lab.title,
                                url: lab.codespacesUrl || 'https://congenial-spork-jq4xg4pqqrf57g.github.dev/'
                              })}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            >
                              <Play size={14} className="mr-1 inline" />
                              {labStatus?.status === 'completed' ? 'Review' : 
                               labStatus?.status === 'in-progress' ? 'Continue' : 
                               'Start Lab'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredLabs.length === 0 && (
        <div className="text-center py-16">
          <div className="category-icon bg-gray-300 mx-auto mb-6">
            <BookOpen size={48} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No labs found</h3>
          <p className="text-gray-600 text-lg">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Lab Environment Modal */}
      {selectedLab && selectedLab.url !== 'code-editor' && (
        <LabEnvironment
          labTitle={selectedLab.title}
          labUrl={selectedLab.url}
          onClose={() => setSelectedLab(null)}
        />
      )}

      {/* Edit Lab Modal */}
      {showEditModal && editingLab && (
        <EditLabModal
          lab={editingLab}
          onClose={() => {
            setShowEditModal(false);
            setEditingLab(null);
          }}
          onUpdate={(updatedLab) => {
            setLabs(labs.map(l => l.id === updatedLab.id ? updatedLab : l));
            
            // Show modern notification
            setNotificationMessage(`Lab "${updatedLab.title}" updated successfully!`);
            setShowNotification(true);
            
            // Close modal and switch to list view
            setShowEditModal(false);
            setEditingLab(null);
            setViewMode('list');
            
            // Auto-hide notification after 4 seconds
            setTimeout(() => {
              setShowNotification(false);
            }, 4000);
          }}
        />
      )}

      {/* Modern Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-green-500 rounded-full p-2">
                  <Check size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Success!
                </h4>
                <p className="text-sm text-gray-600">
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full animate-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Lab Modal Component
const EditLabModal: React.FC<{
  lab: Lab;
  onClose: () => void;
  onUpdate: (lab: Lab) => void;
}> = ({ lab, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lab.title,
    description: lab.description,
    category: lab.category,
    level: lab.level,
    type: lab.type,
    duration: lab.duration,
    instructions: lab.instructions,
    resources: lab.resources.length > 0 ? lab.resources : [''],
    tags: lab.tags.length > 0 ? lab.tags : [''],
    codespacesUrl: lab.codespacesUrl || '',
    expirationHours: lab.expirationHours || 40,
    prerequisites: lab.prerequisites?.length ? lab.prerequisites : [''],
    isActive: lab.isActive,
    certificationCriteria: lab.certificationCriteria || {
      passingScore: 80,
      maxAttempts: 3,
      timeLimit: 120
    },
    projectDeliverables: lab.projectDeliverables?.length ? lab.projectDeliverables : [''],
    estimatedEffort: lab.estimatedEffort || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'duration' || name === 'expirationHours' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'resources' | 'tags' | 'prerequisites' | 'projectDeliverables') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'resources' | 'tags' | 'prerequisites' | 'projectDeliverables') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'resources' | 'tags' | 'prerequisites' | 'projectDeliverables') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty strings from arrays
      const cleanedData = {
        id: lab.id,
        createdAt: lab.createdAt,
        creatorId: lab.creatorId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        type: formData.type,
        duration: formData.duration,
        instructions: formData.instructions,
        codespacesUrl: formData.codespacesUrl,
        expirationHours: formData.expirationHours,
        isActive: formData.isActive,
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
          : undefined
      };

      // Use the API to update the lab
      const updatedLab = await mockApi.updateLab(lab.id, cleanedData);
      
      if (updatedLab) {
        onUpdate(updatedLab);
      } else {
        throw new Error('Failed to update lab');
      }
    } catch (error) {
      console.error('Failed to update lab:', error);
      alert('Failed to update lab. Please try again.');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="category-icon bg-indigo-500">
                <Edit size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Lab</h2>
                <p className="text-gray-600">Modify lab settings and content</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="section-header">
              <Target size={20} className="mr-3 text-indigo-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="form-label">Lab Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                  required
                />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <select
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
                <label className="form-label">Level *</label>
                <select
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
                <label className="form-label">Type *</label>
                <select
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
                <label className="form-label">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Expiration Hours *</label>
                <input
                  type="number"
                  name="expirationHours"
                  value={formData.expirationHours}
                  onChange={handleInputChange}
                  min="1"
                  max="168"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Lab Environment URL</label>
                <input
                  type="url"
                  name="codespacesUrl"
                  value={formData.codespacesUrl}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://your-codespace-url.github.dev/"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="form-label mb-0">Lab is active and visible to students</span>
                </label>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <h3 className="section-header">
              <BookOpen size={20} className="mr-3 text-indigo-600" />
              Instructions
            </h3>
            <div>
              <label className="form-label">Lab Instructions *</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={8}
                className="form-textarea"
                required
              />
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="section-header">
              <BookOpen size={20} className="mr-3 text-indigo-600" />
              Resources
            </h3>
            <div className="space-y-3">
              {formData.resources.map((resource, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={resource}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'resources')}
                    className="form-input flex-1"
                    placeholder="e.g., Dataset: housing_prices.csv"
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
          <div className="space-y-6">
            <h3 className="section-header">
              <Target size={20} className="mr-3 text-indigo-600" />
              Tags
            </h3>
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
          <div className="space-y-6">
            <h3 className="section-header">
              <CheckCircle size={20} className="mr-3 text-indigo-600" />
              Prerequisites
            </h3>
            <div className="space-y-3">
              {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={prerequisite}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'prerequisites')}
                    className="form-input flex-1"
                    placeholder="e.g., Basic programming knowledge"
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
            <div className="space-y-6">
              <h3 className="section-header">
                <Target size={20} className="mr-3 text-indigo-600" />
                Certification Criteria
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Passing Score (%)</label>
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
                  />
                </div>
                <div>
                  <label className="form-label">Max Attempts</label>
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
                  />
                </div>
                <div>
                  <label className="form-label">Time Limit (minutes)</label>
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* Project Deliverables */}
          {formData.type === 'project' && (
            <div className="space-y-6">
              <h3 className="section-header">
                <CheckCircle size={20} className="mr-3 text-indigo-600" />
                Project Deliverables
              </h3>
              <div className="space-y-3">
                {formData.projectDeliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'projectDeliverables')}
                      className="form-input flex-1"
                      placeholder="e.g., Working web application"
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

              <div>
                <label className="form-label">Estimated Effort</label>
                <input
                  type="text"
                  name="estimatedEffort"
                  value={formData.estimatedEffort}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 2-3 weeks, 40 hours"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-3"></div>
                  Updating Lab...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-3" />
                  Update Lab
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabCatalog;