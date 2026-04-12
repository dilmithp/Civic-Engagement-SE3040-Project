import React, { useState, useEffect } from 'react';
import api from '../../api/axios.config';
import { Users as UsersIcon, Shield, Trash2, Edit3, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../hooks/useAuth';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('All Roles');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showToast } = useUI();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('https://auth.civic.dilmith.live/api/users');
      setUsers(res?.users || res?.data?.users || res?.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`https://auth.civic.dilmith.live/api/users/${userId}/role`, { role: newRole });
      showToast('User role updated successfully!');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    
    try {
      await api.delete(`https://auth.civic.dilmith.live/api/users/${userId}`);
      showToast('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All Roles' || u.role === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'official': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-primary-100 text-primary-700 border-primary-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 fade-in">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">System Users</h1>
        <p className="text-textSecondary mt-2">Manage user accounts and platform roles.</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['All Roles', 'User', 'Official', 'Admin'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filterRole === role 
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/80 border-b border-border text-textMuted uppercase text-xs tracking-wider">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0 outline outline-2 outline-white shadow-sm">
                        {u.name[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-textPrimary leading-tight">{u.name}</div>
                        <div className="text-sm text-textMuted">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-textSecondary">
                      {new Date(u.created_at || u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {(u.id || u._id) !== currentUser.id && u.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-2">
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id || u._id, e.target.value)}
                            className="bg-background border border-border text-sm rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="citizen">Citizen</option>
                            <option value="official">Official</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(u.id || u._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                      
                      {(u.id || u._id) === currentUser.id && (
                         <span className="text-xs font-bold text-primary-400">Current User</span>
                      )}
                      
                      {(u.id || u._id) !== currentUser.id && u.role === 'admin' && (
                         <span className="text-xs font-bold text-purple-400">Admin Lock</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-textMuted">
                    <UsersIcon size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No users found matching your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
