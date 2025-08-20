import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Calendar, Clock, CheckCircle, AlertCircle, Edit, Save } from 'lucide-react';
import { Lab, LabAllocation, User as UserType } from '../types';
import { mockApi } from '../services/mockApi';
import LabEnvironment from './LabEnvironment';

const LabAllocations: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [allocations, setAllocations] = useState<LabAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<LabAllocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    // Set up interval to check for expired allocations every 5 minutes
    const checkExpiredAllocations = () => {
      // This will trigger the API to check and update expired allocations
      mockApi.getLabAllocations().then(updatedAllocations => {
        setAllocations(updatedAllocations);
      });
    };

    const intervalId = setInterval(checkExpiredAllocations, 5 * 60 * 1000); // 5 minutes

    const fetchData = async () => {
      try {
        const [labsData, usersData, allocationsData] = await Promise.all([
          mockApi.getLabs(),
          mockApi.getUsers(),
          mockApi.getLabAllocations()
        ]);
        setLabs(labsData);
        setUsers(usersData.filter(u => u.role === 'student'));
        setAllocations(allocationsData);
      } catch (error) {
        console.error('Failed to fetch allocations data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleEditAllocation = (allocation: LabAllocation) => {
    setEditingAllocation(allocation);
    setShowEditModal(true);
  };

  const handleUpdateAllocation = async (updatedAllocation: LabAllocation) => {
    try {
      await mockApi.updateLabAllocation(updatedAllocation.id, {
        labId: updatedAllocation.labId,
        userId: updatedAllocation.userId,
        dueDate: updatedAllocation.dueDate,
        status: updatedAllocation.status
      });
      
      // Update local state
      setAllocations(allocations.map(a => 
        a.id === updatedAllocation.id ? updatedAllocation : a
      ));
      
      setShowEditModal(false);
      setEditingAllocation(null);
    } catch (error) {
      console.error('Failed to update allocation:', error);
      alert('Failed to update allocation. Please try again.');
    }
  };

  const getStatusColor = (status: LabAllocation['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: LabAllocation['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  const filteredAllocations = allocations.filter(allocation => {
    const lab = labs.find(l => l.id === allocation.labId);
    const user = users.find(u => u.id === allocation.userId);
    const searchLower = searchTerm.toLowerCase();
    
    return lab?.title.toLowerCase().includes(searchLower) ||
           user?.name.toLowerCase().includes(searchLower) ||
           user?.email.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-modern p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold heading-gradient mb-4">AI Lab Allocations</h1>
            <p className="text-gray-600 text-lg leading-relaxed">Manage and track AI lab assignments for students and innovators</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 sm:mt-0 btn-primary flex items-center"
          >
            <Plus size={20} className="mr-3" />
            New Allocation
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="card-modern p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search allocations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {['assigned', 'in-progress', 'completed', 'overdue'].map(status => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className={`status-badge ${
                  status === 'assigned' ? 'status-assigned' :
                  status === 'in-progress' ? 'status-in-progress' :
                  status === 'completed' ? 'status-completed' :
                  'status-overdue'
                } text-lg font-bold mb-2`}>
                  {allocations.filter(a => a.status === status).length}
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {status.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allocations List */}
      <div className="table-modern">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Lab
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Allocated
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredAllocations.map(allocation => {
                const lab = labs.find(l => l.id === allocation.labId);
                const student = users.find(u => u.id === allocation.userId);
                const StatusIcon = getStatusIcon(allocation.status);
                
                return (
                  <tr key={allocation.id} className="table-row">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={student?.avatar || `https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150`}
                          alt={student?.name}
                          className="w-12 h-12 avatar mr-4"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{student?.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{lab?.title}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">{lab?.category}</span> • {lab?.duration} min • Expires in {lab?.expirationHours || 40}h
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon size={16} className="mr-3 text-gray-400" />
                        <span className={`status-badge ${
                          allocation.status === 'assigned' ? 'status-assigned' :
                          allocation.status === 'in-progress' ? 'status-in-progress' :
                          allocation.status === 'completed' ? 'status-completed' :
                          'status-overdue'
                        }`}>
                          {allocation.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600">
                      {new Date(allocation.allocatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600">
                      {new Date(allocation.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setSelectedLab({
                            title: lab?.title || 'Lab Environment',
                            url: lab?.codespacesUrl || 'https://congenial-spork-jq4xg4pqqrf57g.github.dev/'
                          })}
                          className="text-green-600 hover:text-green-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-green-50 transition-all duration-200"
                        >
                          Open Lab
                        </button>
                        <button 
                          onClick={() => handleEditAllocation(allocation)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAllocations.length === 0 && (
          <div className="text-center py-16">
            <div className="category-icon bg-gray-300 mx-auto mb-6">
              <User size={48} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No allocations found</h3>
            <p className="text-gray-600 text-lg">Try adjusting your search or create a new allocation</p>
          </div>
        )}
      </div>

      {/* Create Allocation Modal */}
      {showCreateModal && <CreateAllocationModal onClose={() => setShowCreateModal(false)} />}

      {/* Edit Allocation Modal */}
      {showEditModal && editingAllocation && (
        <EditAllocationModal 
          allocation={editingAllocation}
          labs={labs}
          users={users}
          onClose={() => {
            setShowEditModal(false);
            setEditingAllocation(null);
          }}
          onUpdate={handleUpdateAllocation}
        />
      )}

      {/* Lab Environment Modal */}
      {selectedLab && (
        <LabEnvironment
          labTitle={selectedLab.title}
          labUrl={selectedLab.url}
          onClose={() => setSelectedLab(null)}
        />
      )}
    </div>
  );
};

// Create Allocation Modal Component
const CreateAllocationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labs, setLabs] = useState<Lab[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [labsData, usersData] = await Promise.all([
        mockApi.getLabs(),
        mockApi.getUsers()
      ]);
      setLabs(labsData.filter(l => l.isActive));
      setUsers(usersData.filter(u => u.role === 'student'));
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await mockApi.createLabAllocation({
        labId: selectedLab,
        userId: selectedUser,
        allocatedBy: '1', // Current admin user
        dueDate: new Date(dueDate).toISOString(),
        status: 'assigned'
      });
      onClose();
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Failed to create allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-enter max-w-lg p-8">
        <div className="flex items-center mb-8">
          <div className="category-icon bg-indigo-500 mr-4">
            <Plus size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Lab Allocation</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              Select Lab
            </label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a lab...</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.title} ({lab.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Student
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a student...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
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
              className={`btn-primary ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Allocation Modal Component
const EditAllocationModal: React.FC<{
  allocation: LabAllocation;
  labs: Lab[];
  users: UserType[];
  onClose: () => void;
  onUpdate: (allocation: LabAllocation) => void;
}> = ({ allocation, labs, users, onClose, onUpdate }) => {
  const [selectedLab, setSelectedLab] = useState(allocation.labId);
  const [selectedUser, setSelectedUser] = useState(allocation.userId);
  const [status, setStatus] = useState(allocation.status);
  const [dueDate, setDueDate] = useState(allocation.dueDate.split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedAllocation: LabAllocation = {
        ...allocation,
        labId: selectedLab,
        userId: selectedUser,
        status: status as LabAllocation['status'],
        dueDate: new Date(dueDate).toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : allocation.completedAt
      };
      
      onUpdate(updatedAllocation);
    } catch (error) {
      console.error('Failed to update allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLab = labs.find(l => l.id === allocation.labId);
  const currentUser = users.find(u => u.id === allocation.userId);

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-enter max-w-lg p-8">
        <div className="flex items-center mb-8">
          <div className="category-icon bg-indigo-500 mr-4">
            <Edit size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Lab Allocation</h2>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Assignment</h3>
          <p className="text-sm text-gray-600">
            <strong>{currentLab?.title}</strong> assigned to <strong>{currentUser?.name}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              Select Lab
            </label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="form-select"
              required
            >
              {labs.filter(l => l.isActive).map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.title} ({lab.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Student
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-select"
              required
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
              required
            >
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Changing the lab will reassign the student to a different lab</li>
              <li>• Changing status to "completed" will mark the assignment as finished</li>
              <li>• Due date changes will affect deadline notifications</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
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
              className={`btn-primary ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabAllocations;