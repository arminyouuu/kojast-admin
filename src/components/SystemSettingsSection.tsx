import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SystemSetting } from '../types';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function SystemSettingsSection() {
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      const settingsMap: Record<string, SystemSetting> = {};
      const valuesMap: Record<string, unknown> = {};

      data?.forEach((setting) => {
        settingsMap[setting.key] = setting;
        valuesMap[setting.key] = setting.value;
      });

      setSettings(settingsMap);
      setEditedValues(valuesMap);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to save settings');
        return;
      }

      const updates = Object.keys(editedValues).map((key) => ({
        key,
        value: editedValues[key],
        description: settings[key]?.description || null,
        updated_by: user.id
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates);

      if (error) throw error;

      await loadSettings();
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleValueChange = (key: string, value: unknown) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const renderSettingInput = (key: string, value: unknown, description: string | null) => {
    if (typeof value === 'boolean') {
      return (
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={editedValues[key] as boolean}
            onChange={(e) => handleValueChange(key, e.target.checked)}
            className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
          />
          <span className="text-sm text-slate-700">Enable</span>
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={editedValues[key] as number}
          onChange={(e) => handleValueChange(key, Number(e.target.value))}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      );
    }

    return (
      <input
        type="text"
        value={String(editedValues[key] || '')}
        onChange={(e) => handleValueChange(key, e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        placeholder={description || ''}
      />
    );
  };

  const formatKey = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const hasChanges = () => {
    return Object.keys(editedValues).some(
      (key) => JSON.stringify(editedValues[key]) !== JSON.stringify(settings[key]?.value)
    );
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
          <Settings className="w-6 h-6 text-slate-900" />
          <h3 className="text-xl font-bold text-slate-900">System Settings</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadSettings}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges() || isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {Object.keys(settings).length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <Settings className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">No system settings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(settings).map(([key, setting]) => (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <div className="mb-3">
                <h4 className="font-semibold text-slate-900 text-lg mb-1">
                  {formatKey(key)}
                </h4>
                {setting.description && (
                  <p className="text-sm text-slate-600">{setting.description}</p>
                )}
              </div>
              {renderSettingInput(key, setting.value, setting.description)}
              {setting.updated_at && (
                <p className="text-xs text-slate-500 mt-2">
                  Last updated: {new Date(setting.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {hasChanges() && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}
    </div>
  );
}
