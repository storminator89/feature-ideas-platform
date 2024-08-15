import React from 'react'
import { ChartBarIcon, FolderIcon, UserIcon, LightBulbIcon } from '@heroicons/react/24/outline'

interface AdminTabsProps {
  activeTab: 'dashboard' | 'categories' | 'users' | 'ideas'
  onTabChange: (tab: 'dashboard' | 'categories' | 'users' | 'ideas') => void
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { name: 'dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { name: 'categories', icon: FolderIcon, label: 'Categories' },
    { name: 'users', icon: UserIcon, label: 'Users' },
    { name: 'ideas', icon: LightBulbIcon, label: 'Ideas' },
  ] as const;

  return (
    <nav className="-mb-px flex">
      {tabs.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => onTabChange(name)}
          className={`${
            activeTab === name
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
        >
          <Icon className="h-5 w-5 mr-2" />
          {label}
        </button>
      ))}
    </nav>
  )
}

export default AdminTabs