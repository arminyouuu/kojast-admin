import { useState } from 'react';
import { LayoutDashboard, BarChart3, Key, Activity, Settings, Menu } from 'lucide-react';
import AnalyticsSection from './AnalyticsSection';
import ApiKeysSection from './ApiKeysSection';
import ActivityLogsSection from './ActivityLogsSection';
import SystemSettingsSection from './SystemSettingsSection';

type TabType = 'overview' | 'api' | 'activity' | 'settings';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'api' as TabType, label: 'API Keys', icon: Key },
    { id: 'activity' as TabType, label: 'Activity Logs', icon: Activity },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="w-8 h-8 text-slate-900" />
          <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
        </div>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`border-b border-slate-200 ${showMobileMenu ? 'block' : 'hidden'} lg:block`}>
          <div className="flex flex-col lg:flex-row">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === 'overview' && <AnalyticsSection />}
          {activeTab === 'api' && <ApiKeysSection />}
          {activeTab === 'activity' && <ActivityLogsSection />}
          {activeTab === 'settings' && <SystemSettingsSection />}
        </div>
      </div>
    </div>
  );
}
