/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { BrandView } from './components/brand/BrandView';
import { TemplatesView } from './components/templates/TemplatesView';
import { TodayView } from './components/today/TodayView';
import { ProjectsView } from './components/projects/ProjectsView';
import { AssetsView } from './components/assets/AssetsView';
import { ContentLibraryView } from './components/content/ContentLibraryView';
import { SettingsView } from './components/settings/SettingsView';
import { IdeasView } from './components/ideas/IdeasView';
import { CalendarView } from './components/calendar/CalendarView';
import { BulkProductionView } from './components/bulk/BulkProductionView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CommandPalette } from './components/layout/CommandPalette';
import { initialProject } from './core/defaults';
import { Project, SectionTab, BrandSystem, Idea, ContentRecord, Template, Asset } from './types';
import { Construction, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'contentforge_project_v3';

export default function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure ideas and series are present if migrating from older local storage
        if (!parsed.ideas) parsed.ideas = initialProject.ideas;
        if (!parsed.series) parsed.series = initialProject.series;
        if (!parsed.assets || parsed.assets.length === 0) parsed.assets = initialProject.assets;
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load project from local storage:', e);
    }
    return initialProject;
  });

  const [activeTab, setActiveTab] = useState<SectionTab>('dashboard');

  // Global CMD+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Local persistence on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to persist project:', e);
    }
  }, [project]);

  const handleUpdateBrand = (newBrand: BrandSystem) => {
    setProject((prev) => ({
      ...prev,
      brand: newBrand,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleAddIdea = (newIdea: Idea) => {
    setProject((prev) => ({
      ...prev,
      ideas: [newIdea, ...(prev.ideas || [])],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleUpdateIdeaStatus = (id: string, status: Idea['status']) => {
    setProject((prev) => ({
      ...prev,
      ideas: (prev.ideas || []).map((idea) =>
        idea.id === id ? { ...idea, status } : idea
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleUseIdeaAsToday = (idea: Idea) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: ContentRecord = {
      id: `rec_${Date.now()}`,
      title: idea.title,
      subtitle: `${idea.category.toUpperCase()} // ${idea.theme.toUpperCase()}`,
      cta: 'Explore More at ContentForge',
      date: todayStr,
      category: idea.category,
      theme: idea.theme,
      style: 'Editorial',
      templateId: project.templates[0]?.id || 'tmpl_01',
      brandId: project.brand.id,
      format: idea.format || 'Instagram-Post',
      status: 'Ready',
      caption: `${idea.title}\n\nKey Focus: ${idea.notes || idea.theme}\n\n#ContentForge #GraphicDesign #EditorialDesign`,
      hashtags: ['#GraphicDesign', '#Typography', '#EditorialDesign', '#DesignSystem'],
      notes: idea.notes,
      activeVariationId: 'original',
      variations: [
        {
          id: 'original',
          name: 'Original',
          label: 'Default Brand Palette (Charcoal & Vermilion)',
          accentColor: '#E11D48',
          bgFill: '#0F172A',
          headingFont: 'Plus Jakarta Sans',
          title: idea.title.toUpperCase(),
          subtitle: `${idea.category.toUpperCase()} // SYSTEM`,
          cta: 'LEARN MORE'
        },
        {
          id: 'var_a',
          name: 'Variation A',
          label: 'Editorial Warm High-Contrast (Paper White & Noir)',
          accentColor: '#020617',
          bgFill: '#F8FAFC',
          headingFont: 'Syne',
          title: idea.title.toUpperCase(),
          subtitle: 'EDITORIAL PERSPECTIVE',
          cta: 'READ FULL ARTICLE'
        },
        {
          id: 'var_b',
          name: 'Variation B',
          label: 'Electric Amber Experimental (Dark Luxury)',
          accentColor: '#F59E0B',
          bgFill: '#18181B',
          headingFont: 'Space Grotesk',
          title: idea.title.toUpperCase(),
          subtitle: 'EXPERIMENTAL LAB',
          cta: 'SAVE FOR LATER'
        },
        {
          id: 'var_c',
          name: 'Variation C',
          label: 'Brutalist Monospaced (Cobalt Tension)',
          accentColor: '#38BDF8',
          bgFill: '#090D16',
          headingFont: 'Inter',
          title: idea.title.toUpperCase(),
          subtitle: 'BRUTALIST ARCHIVE',
          cta: 'START CHALLENGE'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProject((prev) => ({
      ...prev,
      records: [newRecord, ...prev.records],
      updatedAt: new Date().toISOString()
    }));

    setActiveTab('today');
  };

  const handleUpdateRecord = (updatedRecord: ContentRecord) => {
    setProject((prev) => ({
      ...prev,
      records: prev.records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSelectCalendarRecord = (record: ContentRecord) => {
    // Bring this record to the top so TodayView displays it
    setProject((prev) => {
      const rest = prev.records.filter((r) => r.id !== record.id);
      return {
        ...prev,
        records: [record, ...rest]
      };
    });
    setActiveTab('today');
  };

  const handleScheduleNew = (date: string) => {
    const newRecord: ContentRecord = {
      id: `rec_${Date.now()}`,
      title: `Scheduled Post for ${date}`,
      subtitle: 'PLANNED CONTENT',
      cta: 'Coming Soon',
      date: date,
      category: 'Design Theory',
      theme: 'Scheduled',
      style: 'Modern',
      templateId: project.templates[0]?.id || 'tmpl_01',
      brandId: project.brand.id,
      format: 'Instagram-Post',
      status: 'Idea',
      caption: `Scheduled draft for ${date}`,
      hashtags: ['#ContentForge', '#DesignSchedule'],
      activeVariationId: 'original',
      variations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProject((prev) => ({
      ...prev,
      records: [newRecord, ...prev.records]
    }));
    setActiveTab('today');
  };

  const handleCommitBulkRecords = (newRecords: ContentRecord[]) => {
    setProject((prev) => ({
      ...prev,
      records: [...newRecords, ...prev.records],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleUpdateTemplate = (updatedTemplate: Template) => {
    setProject((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleAddAsset = (newAsset: Asset) => {
    setProject((prev) => ({
      ...prev,
      assets: [newAsset, ...(prev.assets || [])],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDeleteAsset = (id: string) => {
    setProject((prev) => ({
      ...prev,
      assets: (prev.assets || []).filter((a) => a.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleApplyAssetToRecord = (asset: Asset, mode: 'emblem' | 'background') => {
    setProject((prev) => {
      const records = [...(prev.records || [])];
      if (records.length === 0) return prev;
      const targetRecord = { ...records[0] };
      const variations = [...(targetRecord.variations || [])];
      const activeVarIndex = variations.findIndex((v) => v.id === targetRecord.activeVariationId);
      const targetVarIndex = activeVarIndex >= 0 ? activeVarIndex : 0;

      if (variations[targetVarIndex]) {
        variations[targetVarIndex] = {
          ...variations[targetVarIndex],
          ...(mode === 'emblem' ? { emblemAssetUrl: asset.url } : { bgTextureUrl: asset.url })
        };
      }
      targetRecord.variations = variations;
      records[0] = targetRecord;

      return {
        ...prev,
        records,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleCreateRecord = (newRecord: ContentRecord) => {
    setProject((prev) => ({
      ...prev,
      records: [newRecord, ...(prev.records || [])],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDeleteRecord = (id: string) => {
    setProject((prev) => ({
      ...prev,
      records: (prev.records || []).filter((r) => r.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${project.name.toLowerCase().replace(/\s+/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProject(initialProject);
    setActiveTab('dashboard');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new-content') {
      setActiveTab('today');
    }
  };

  return (
    <AppShell
      project={project}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onQuickAction={handleQuickAction}
    >
      {activeTab === 'dashboard' && (
        <DashboardView project={project} onNavigate={setActiveTab} />
      )}
      {activeTab === 'today' && (
        <TodayView project={project} onUpdateRecord={handleUpdateRecord} />
      )}
      {activeTab === 'bulk' && (
        <BulkProductionView
          project={project}
          onCommitBulkRecords={handleCommitBulkRecords}
          onNavigateToRecord={handleSelectCalendarRecord}
        />
      )}
      {activeTab === 'integrations' && (
        <IntegrationsView
          project={project}
          onUpdateRecord={handleUpdateRecord}
          onNavigateTab={setActiveTab}
        />
      )}
      {activeTab === 'ideas' && (
        <IdeasView
          project={project}
          onAddIdea={handleAddIdea}
          onUseIdeaAsToday={handleUseIdeaAsToday}
          onUpdateIdeaStatus={handleUpdateIdeaStatus}
        />
      )}
      {activeTab === 'calendar' && (
        <CalendarView
          project={project}
          onSelectRecord={handleSelectCalendarRecord}
          onScheduleNew={handleScheduleNew}
        />
      )}
      {activeTab === 'templates' && (
        <TemplatesView project={project} onUpdateTemplate={handleUpdateTemplate} />
      )}
      {activeTab === 'brand' && (
        <BrandView brand={project.brand} onUpdateBrand={handleUpdateBrand} />
      )}
      {activeTab === 'projects' && (
        <ProjectsView project={project} onExportProjectJson={handleExportJson} />
      )}
      {activeTab === 'assets' && (
        <AssetsView
          project={project}
          onAddAsset={handleAddAsset}
          onDeleteAsset={handleDeleteAsset}
          onApplyAssetToRecord={handleApplyAssetToRecord}
          onNavigateTab={setActiveTab}
        />
      )}
      {activeTab === 'content-library' && (
        <ContentLibraryView
          project={project}
          onUpdateRecord={handleUpdateRecord}
          onCreateRecord={handleCreateRecord}
          onDeleteRecord={handleDeleteRecord}
          onNavigateTab={setActiveTab}
          onSelectRecordForToday={handleSelectCalendarRecord}
        />
      )}
      {activeTab === 'settings' && (
        <SettingsView
          project={project}
          onExportJson={handleExportJson}
          onResetToDefaults={handleResetToDefaults}
        />
      )}

      {/* Phase 7 Analytics & Performance Loop */}
      {activeTab === 'analytics' && (
        <AnalyticsView project={project} onNavigateTab={setActiveTab} />
      )}

      {/* Phase 9 Global Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onExportJson={handleExportJson}
      />
    </AppShell>
  );
}
