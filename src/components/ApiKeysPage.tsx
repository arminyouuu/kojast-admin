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

      {newlyCreatedKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-2">API Key Created Successfully</h3>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2 text-lg">
          <AlertCircle className="w-5 h-5" />
          <span>API Usage Guide</span>
        </h3>
        <div className="text-sm text-blue-800 space-y-4">
          <p className="font-medium">Use your API keys to authenticate requests to the Kojast API. All requests require the <code className="bg-blue-100 px-1.5 py-0.5 rounded">X-API-Key</code> header.</p>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Read Operations (Read Permission Required)</h4>

              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200 mb-2">
                <div className="text-emerald-600 font-semibold mb-1">GET /api/places</div>
                <div className="text-slate-400">Headers:</div>
                <div className="text-blue-600 ml-2">X-API-Key: your_api_key_here</div>
              </div>

              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200 mb-2">
                <div className="text-emerald-600 font-semibold mb-1">GET /api/places/:id</div>
                <div className="text-slate-400">Headers:</div>
                <div className="text-blue-600 ml-2">X-API-Key: your_api_key_here</div>
              </div>

              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200">
                <div className="text-emerald-600 font-semibold mb-1">GET /api/categories</div>
                <div className="text-slate-400">Headers:</div>
                <div className="text-blue-600 ml-2">X-API-Key: your_api_key_here</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Write Operations (Write Permission Required)</h4>

              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200 mb-2">
                <div className="text-orange-600 font-semibold mb-1">POST /api/places</div>
                <div className="text-slate-400">Headers:</div>
                <div className="text-blue-600 ml-2 mb-1">X-API-Key: your_api_key_here</div>
                <div className="text-blue-600 ml-2">Content-Type: application/json</div>
                <div className="text-slate-400 mt-2">Body:</div>
                <div className="text-slate-600 ml-2">{'{'}</div>
                <div className="text-slate-600 ml-4">"name": "New Place",</div>
                <div className="text-slate-600 ml-4">"description": "Description",</div>
                <div className="text-slate-600 ml-4">"category_id": "uuid",</div>
                <div className="text-slate-600 ml-4">"latitude": 40.7128,</div>
                <div className="text-slate-600 ml-4">"longitude": -74.0060</div>
                <div className="text-slate-600 ml-2">{'}'}</div>
              </div>

              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200 mb-2">
                <div className="text-amber-600 font-semibold mb-1">PUT /api/places/:id</div>
                <div className="text-slate-400">Headers:</div>
                <div className="text-blue-600 ml-2 mb-1">X-API-Key: your_api_key_here</div>
                <div className="text-blue-600 ml-2">Content-Type: application/json</div>
                <div className="text-slate-400 mt-2">Body:</div>
                <div className="text-slate-600 ml-2">{'{'}</div>
                <div className="text-slate-600 ml-4">"name": "Updated Name",</div>
                <div className="text-slate-600 ml-4">"description": "Updated description"</div>
                <div className="text-slate-600 ml-2">{'}'}</div>
              </div>

              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200">
                <div className="text-red-600 font-semibold mb-1">DELETE /api/places/:id</div>
                <div className="text-slate-400">Headers:</div>
                <div className="text-blue-600 ml-2">X-API-Key: your_api_key_here</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Example with JavaScript fetch()</h4>
              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto border border-blue-200">
                <div className="text-slate-600">
                  <div className="text-purple-600">const</div> response = <div className="inline text-purple-600">await</div> fetch('https://api.kojast.com/api/places', {'{'}</div>
                <div className="text-slate-600 ml-2">method: <span className="text-green-600">'GET'</span>,</div>
                <div className="text-slate-600 ml-2">headers: {'{'}</div>
                <div className="text-slate-600 ml-4"><span className="text-green-600">'X-API-Key'</span>: <span className="text-green-600">'your_api_key_here'</span></div>
                <div className="text-slate-600 ml-2">{'}'}</div>
                <div className="text-slate-600">{'}'});</div>
                <div className="text-slate-600 mt-1"><div className="inline text-purple-600">const</div> data = <div className="inline text-purple-600">await</div> response.json();</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Response Codes</h4>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <ul className="space-y-1 text-xs">
                  <li><code className="text-emerald-600 font-semibold">200 OK</code> - Request successful</li>
                  <li><code className="text-orange-600 font-semibold">201 Created</code> - Resource created successfully</li>
                  <li><code className="text-red-600 font-semibold">401 Unauthorized</code> - Invalid or missing API key</li>
                  <li><code className="text-red-600 font-semibold">403 Forbidden</code> - Insufficient permissions</li>
                  <li><code className="text-red-600 font-semibold">404 Not Found</code> - Resource not found</li>
                  <li><code className="text-red-600 font-semibold">500 Server Error</code> - Internal server error</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
            <p className="font-semibold mb-2">Security Best Practices:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Never share your API keys publicly or commit them to version control</li>
              <li>Use environment variables to store API keys in your applications</li>
              <li>Generate separate keys for different environments (dev, staging, production)</li>
              <li>Grant only the minimum permissions needed (Read vs Write)</li>
              <li>Rotate API keys regularly and immediately deactivate compromised keys</li>
              <li>Monitor API key usage through the "Last Used" column</li>
            </ul>
          </div>
        </div>
      </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
