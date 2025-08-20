import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Clock, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Lab, LabAllocation } from '../types';
import { mockApi } from '../services/mockApi';
import LabEnvironment from './LabEnvironment';

interface DashboardProps {
  onViewChange?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [allocations, setAllocations] = useState<LabAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [labsData, allocationsData] = await Promise.all([
          mockApi.getLabs(),
          user?.role === 'student' 
            // This will automatically check and update expired allocations
            ? mockApi.getAllocationsByUser(user.id)
            : mockApi.getLabAllocations()
        ]);
        setLabs(labsData);
        setAllocations(allocationsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getDashboardStats = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Total Labs', value: labs.length, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'Active Allocations', value: allocations.length, icon: Calendar, color: 'bg-green-500' },
        { label: 'Total Users', value: 4, icon: Users, color: 'bg-purple-500' },
        { label: 'Completion Rate', value: '85%', icon: TrendingUp, color: 'bg-teal-500' }
      ];
    } else if (user?.role === 'creator') {
      const myLabs = labs.filter(lab => lab.creatorId === user.id);
      return [
        { label: 'My Labs', value: myLabs.length, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'Active Labs', value: myLabs.filter(lab => lab.isActive).length, icon: Target, color: 'bg-green-500' },
        { label: 'Total Allocations', value: allocations.filter(a => myLabs.some(l => l.id === a.labId)).length, icon: Users, color: 'bg-purple-500' },
        { label: 'Avg. Duration', value: `${Math.round(myLabs.reduce((acc, lab) => acc + lab.duration, 0) / myLabs.length || 0)}m`, icon: Clock, color: 'bg-teal-500' }
      ];
    } else {
      const myAllocations = allocations.filter(a => a.userId === user?.id);
      return [
        { label: 'Assigned Labs', value: myAllocations.length, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'In Progress', value: myAllocations.filter(a => a.status === 'in-progress').length, icon: Clock, color: 'bg-yellow-500' },
        { label: 'Completed', value: myAllocations.filter(a => a.status === 'completed').length, icon: Target, color: 'bg-green-500' },
        { label: 'Overdue', value: myAllocations.filter(a => a.status === 'overdue').length, icon: TrendingUp, color: 'bg-red-500' }
      ];
    }
  };

  const getRecentActivity = () => {
    if (user?.role === 'student') {
      return allocations
        .filter(a => a.userId === user.id)
        .sort((a, b) => new Date(b.allocatedAt).getTime() - new Date(a.allocatedAt).getTime())
        .slice(0, 5)
        .map(allocation => {
          const lab = labs.find(l => l.id === allocation.labId);
          return {
            id: allocation.id,
            title: lab?.title || 'Unknown Lab',
            description: `Status: ${allocation.status}`,
            timestamp: allocation.allocatedAt,
            type: 'allocation' as const
          };
        });
    } else {
      return labs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(lab => ({
          id: lab.id,
          title: lab.title,
          description: lab.description,
          timestamp: lab.createdAt,
          type: 'lab' as const
        }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  const stats = getDashboardStats();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-8">
      <div className="card-modern p-8">
        <h1 className="text-3xl font-bold heading-gradient mb-4">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          {user?.role === 'admin' && "Manage labs, allocations, and users from your admin dashboard."}
          {user?.role === 'creator' && "Create and manage AI-powered labs, track student progress and innovation."}
          {user?.role === 'student' && "Continue your AI learning journey with hands-on labs and cutting-edge technology."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center">
                <div className={`stat-icon ${stat.color} mr-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card-modern p-6">
          <h3 className="section-header">
            <Clock size={20} className="mr-3 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    if (user?.role === 'student' && activity.type === 'allocation') {
                      const lab = labs.find(l => l.id === activity.id);
                      setSelectedLab({
                        title: activity.title,
                        url: lab?.codespacesUrl || 'https://congenial-spork-jq4xg4pqqrf57g.github.dev/'
                      });
                    }
                  }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="category-icon category-ai">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    {user?.role === 'student' && activity.type === 'allocation' && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Click to open lab environment
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-modern p-6">
          <h3 className="section-header">
            <Target size={20} className="mr-3 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-4">
            {user?.role === 'admin' && (
              <>
                <button className="quick-action quick-action-blue">
                  <div className="flex items-center">
                    <div className="category-icon bg-blue-500 mr-4">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-blue-900 block">Manage Lab Allocations</span>
                      <span className="text-blue-600 text-sm">Assign labs to students</span>
                    </div>
                  </div>
                </button>
                <button 
                  className="quick-action quick-action-green"
                  onClick={() => onViewChange?.('catalog')}
                >
                  <div className="flex items-center">
                    <div className="category-icon bg-green-500 mr-4">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-green-900 block">View All Labs</span>
                      <span className="text-green-600 text-sm">Browse lab catalog</span>
                    </div>
                  </div>
                </button>
              </>
            )}
            {user?.role === 'creator' && (
              <>
                <button className="quick-action quick-action-purple">
                  <div className="flex items-center">
                    <div className="category-icon bg-purple-500 mr-4">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-purple-900 block">Create New Lab</span>
                      <span className="text-purple-600 text-sm">Build learning experiences</span>
                    </div>
                  </div>
                </button>
                <button className="quick-action quick-action-orange">
                  <div className="flex items-center">
                    <div className="category-icon bg-orange-500 mr-4">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-orange-900 block">View Lab Analytics</span>
                      <span className="text-orange-600 text-sm">Track performance</span>
                    </div>
                  </div>
                </button>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <button 
                  className="quick-action quick-action-blue"
                  onClick={() => setSelectedLab({
                    title: 'Lab Environment',
                    url: 'https://congenial-spork-jq4xg4pqqrf57g.github.dev/'
                  })}
                >
                  <div className="flex items-center">
                    <div className="category-icon bg-blue-500 mr-4">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-blue-900 block">Open Lab Environment</span>
                      <span className="text-blue-600 text-sm">Access your assigned labs</span>
                    </div>
                  </div>
                </button>
                <button className="quick-action quick-action-green">
                  <div className="flex items-center">
                    <div className="category-icon bg-green-500 mr-4">
                      <Target size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-green-900 block">Continue Learning</span>
                      <span className="text-green-600 text-sm">Resume your progress</span>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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

export default Dashboard;