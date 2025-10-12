import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ApiKey } from '../types';
import { Key, Plus, Trash2, Copy, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

export default function ApiKeysSection() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState({ read: true, write: false });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'cpk_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const createApiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to create API keys');
        return;
      }

      const key = generateApiKey();

      const { error } = await supabase
        .from('api_keys')
        .insert({
          key,
          name: newKeyName,
          user_id: user.id,
          permissions: newKeyPermissions,
          is_active: true
        });

      if (error) throw error;

      setGeneratedKey(key);
      setNewKeyName('');
      setNewKeyPermissions({ read: true, write: false });
      await loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Failed to update API key status');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Key className="w-6 h-6 text-slate-900" />
          <h3 className="text-xl font-bold text-slate-900">API Keys</h3>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Key</span>
        </button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <Key className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 mb-4">No API keys yet</p>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Create Your First Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-slate-900 text-lg">{key.name}</h4>
                    {key.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <code className="px-3 py-1.5 bg-slate-100 rounded text-sm font-mono text-slate-700">
                      {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title={visibleKeys.has(key.id) ? 'Hide key' : 'Show key'}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title="Copy key"
                    >
                      {copiedKey === key.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span>Created: {formatDate(key.created_at)}</span>
                    {key.last_used_at && <span>Last used: {formatDate(key.last_used_at)}</span>}
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-slate-600">Permissions:</span>
                    {key.permissions.read && (
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">Read</span>
                    )}
                    {key.permissions.write && (
                      <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-800">Write</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleKeyStatus(key.id, key.is_active)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title={key.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {key.is_active ? (
                      <XCircle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {generatedKey ? 'API Key Generated' : 'Create New API Key'}
            </h3>

            {generatedKey ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 mb-3 font-medium">
                    Your API key has been generated. Copy it now as you won't be able to see it again!
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono text-slate-900 break-all">
                      {generatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedKey, 'new')}
                      className="p-2 hover:bg-green-100 rounded transition-colors"
                    >
                      {copiedKey === 'new' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-green-700" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setGeneratedKey(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.read}
                        onChange={(e) =>
                          setNewKeyPermissions({ ...newKeyPermissions, read: e.target.checked })
                        }
                        className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                      />
                      <span className="ml-2 text-sm text-slate-700">Read access</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.write}
                        onChange={(e) =>
                          setNewKeyPermissions({ ...newKeyPermissions, write: e.target.checked })
                        }
                        className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                      />
                      <span className="ml-2 text-sm text-slate-700">Write access</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName('');
                      setNewKeyPermissions({ read: true, write: false });
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createApiKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
