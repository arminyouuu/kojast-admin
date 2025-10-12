import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { ApiKey } from '../types';
import { Key, Plus, Trash2, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState({ read: true, write: false });
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const data = await api.apiKeys.getAll();
      setApiKeys(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      const newKey = await api.apiKeys.create(newKeyName, newKeyPermissions);
      setApiKeys([newKey, ...apiKeys]);
      setNewlyCreatedKey(newKey.key);
      setNewKeyName('');
      setNewKeyPermissions({ read: true, write: false });
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await api.apiKeys.delete(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    }
  };

  const handleToggleActive = async (key: ApiKey) => {
    try {
      const updated = await api.apiKeys.update(key.id, { is_active: !key.is_active });
      setApiKeys(apiKeys.map(k => k.id === key.id ? updated : k));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
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
        <div>
          <h2 className="text-2xl font-bold text-slate-900">API Keys</h2>
          <p className="text-slate-600 mt-1">Manage API keys for external application access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>


      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {newlyCreatedKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-2">API Key Created Successfully</h3>
              <p className="text-sm text-emerald-700 mb-3">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-emerald-200">
                <code className="flex-1 text-sm font-mono text-slate-900 break-all">{newlyCreatedKey}</code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="flex-shrink-0 p-2 hover:bg-emerald-100 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedKey === newlyCreatedKey ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
                  ) : (
                    <Copy className="w-4 h-4 text-emerald-600 transition-transform hover:scale-110" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-emerald-600 hover:text-emerald-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Key className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No API Keys Yet</h3>
          <p className="text-slate-600 mb-6">Generate your first API key to start using the API</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Generate API Key
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">API Key</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Permissions</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Last Used</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Created</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm text-slate-600 font-mono">{maskApiKey(key.key)}</code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedKey === key.key ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400 transition-transform hover:scale-110" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {key.permissions.read && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            Read
                          </span>
                        )}
                        {key.permissions.write && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                            Write
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(key)}
                        className="flex items-center space-x-1"
                      >
                        {key.is_active ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-emerald-600 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600 font-medium">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete API key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Generate New API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Mobile App, Development"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.read}
                      onChange={(e) => setNewKeyPermissions({ ...newKeyPermissions, read: e.target.checked })}
                      className="w-4 h-4 text-slate-900 rounded"
                    />
                    <span className="text-sm text-slate-700">Read Access (View places and categories)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.write}
                      onChange={(e) => setNewKeyPermissions({ ...newKeyPermissions, write: e.target.checked })}
                      className="w-4 h-4 text-slate-900 rounded"
                    />
                    <span className="text-sm text-slate-700">Write Access (Create, update, and delete)</span>
                  </label>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> The API key will only be shown once. Make sure to copy and save it securely.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                  setNewKeyPermissions({ read: true, write: false });
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={isCreating || !newKeyName.trim()}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
            
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>API Usage Guide</span>
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>Use your API keys to authenticate requests to the Kojast API:</p>
          <div className="bg-white rounded p-3 font-mono text-xs overflow-x-auto border border-blue-200">
            <div className="text-slate-600 mb-1">GET /api/places</div>
            <div className="text-slate-400">Headers:</div>
            <div className="text-blue-600 ml-2">X-API-Key: your_api_key_here</div>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Read</strong> permissions allow fetching places and categories</li>
            <li><strong>Write</strong> permissions allow creating, updating, and deleting data</li>
            <li>Keep your API keys secure and never share them publicly</li>
            <li>You can deactivate keys at any time without deleting them</li>
          </ul>
        </div>
      </div>
          </div>
        </div>
      )}
    </div>
  );
}
