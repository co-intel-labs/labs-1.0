import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Shield, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { User as UserType } from '../types';
import { mockApi } from '../services/mockApi';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await mockApi.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getStatusColor = (status: UserType['status']) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'disabled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: UserType['status']) => {
    switch (status) {
      case 'new': return Clock;
      case 'verified': return CheckCircle;
      case 'active': return CheckCircle;
      case 'disabled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getRoleColor = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'creator': return 'bg-indigo-100 text-indigo-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = async (userId: string, newStatus: UserType['status']) => {
    try {
      await mockApi.updateUserStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus, emailVerified: newStatus !== 'new' } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleSendVerification = async (userId: string) => {
    try {
      await mockApi.sendVerificationEmail(userId);
      alert('Verification email sent successfully!');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      alert('Failed to send verification email');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'verified', label: 'Verified' },
    { value: 'active', label: 'Active' },
    { value: 'disabled', label: 'Disabled' }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'creator', label: 'Creator' },
    { value: 'student', label: 'Student' }
  ];

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold heading-gradient mb-4">User Management</h1>
            <p className="text-gray-600 text-lg">Manage USAII Labs users, their roles, and account status</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 sm:mt-0 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
          >
            <Plus size={20} className="mr-3" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {['all', 'new', 'verified', 'active', 'disabled'].map(status => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {status === 'all' ? users.length : users.filter(u => u.status === status).length}
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {status === 'all' ? 'Total' : status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Email Verified
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredUsers.map(user => {
                const StatusIcon = getStatusIcon(user.status);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={user.avatar || `https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150`}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm mr-4"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        <Shield size={12} className="mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon size={16} className="mr-2 text-gray-400" />
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value as UserType['status'])}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${getStatusColor(user.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="verified">Verified</option>
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.emailVerified ? (
                          <CheckCircle size={16} className="text-green-500 mr-2" />
                        ) : (
                          <XCircle size={16} className="text-red-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-600">
                          {user.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {!user.emailVerified && (
                          <button
                            onClick={() => handleSendVerification(user.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                          >
                            <Mail size={14} className="mr-1" />
                            Send Verification
                          </button>
                        )}
                        <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all duration-200">
                          <Edit size={14} className="mr-1 inline" />
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200">
                          <Trash2 size={14} className="mr-1 inline" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">No users found</h3>
            <p className="text-gray-600 text-lg">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)}
          onUserCreated={(newUser) => {
            setUsers([...users, newUser]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: React.FC<{ 
  onClose: () => void; 
  onUserCreated: (user: UserType) => void;
}> = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserType['role']
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newUser = await mockApi.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      
      onUserCreated(newUser);
      alert('User created successfully! Verification email has been sent.');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-xl">
        <div className="flex items-center mb-8">
          <div className="bg-blue-500 p-3 rounded-lg mr-4">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="student">Student</option>
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A verification email will be sent to the user's email address. 
              The user will need to verify their email before they can log in.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Creating User...
                </>
              ) : (
                <>
                  <Plus size={20} className="mr-3" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;