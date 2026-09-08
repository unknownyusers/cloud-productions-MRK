import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Project, SectionTab } from '../../types';

interface AppShellProps {
  project: Project;
  activeTab: SectionTab;
  onTabChange: (tab: SectionTab) => void;
  onQuickAction?: (action: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  project,
  activeTab,
  onTabChange,
  onQuickAction,
  children
}) => {
  return (
    <div id="app-shell-root" className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Permanent Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        streakDays={project.streakDays}
      />

      {/* Main View Area: Header + Scrollable Content */}
      <div id="app-shell-main-viewport" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
        <Header
          project={project}
          activeTab={activeTab}
          onQuickAction={onQuickAction}
        />

        <main id="app-shell-content-container" className="flex-1 overflow-y-auto bg-slate-950/60 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
