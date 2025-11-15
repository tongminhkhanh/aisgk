
import React from 'react';
import { Tab, TABS } from '../types';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="flex justify-center flex-wrap gap-2 md:gap-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-sky-500 ${
            activeTab === tab.id
              ? 'bg-primary text-white shadow-lg'
              : 'bg-surface text-text-secondary hover:bg-slate-700 hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
