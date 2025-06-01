'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Zap,
  Clock,
  Calendar,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TemplateAutomationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rules' | 'workflows' | 'analytics'>('rules');

  // Mock automation data
  const automationRules = [
    {
      id: 1,
      name: "Morning Routine Auto-Start",
      template: "Morning Productivity Routine",
      trigger: "Daily at 7:00 AM",
      status: "active",
      lastRun: "2024-01-15 07:00:00",
      successRate: 95
    },
    {
      id: 2,
      name: "Weekly Planning Reminder",
      template: "Weekly Planning Template",
      trigger: "Every Sunday at 6:00 PM",
      status: "paused",
      lastRun: "2024-01-14 18:00:00",
      successRate: 88
    }
  ];

  const workflows = [
    {
      id: 1,
      name: "Productivity Chain",
      description: "Morning routine → Focus session → Review",
      templates: ["Morning Routine", "Deep Work Session", "Daily Review"],
      status: "active",
      completionRate: 92
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/templates">
              <Button variant="ghost" className="gap-2 -ml-4 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Template Automation
              </h1>
              <p className="text-gray-600 mt-1">Automate your workflows and boost productivity</p>
            </div>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'rules', label: 'Automation Rules', icon: Zap },
                { id: 'workflows', label: 'Workflows', icon: Target },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Automation Rules</h2>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
              
              <div className="space-y-4">
                {automationRules.map(rule => (
                  <motion.div
                    key={rule.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                          <Badge className={cn(
                            rule.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          )}>
                            {rule.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Template: {rule.template}</p>
                        <p className="text-sm text-gray-500">Trigger: {rule.trigger}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="text-gray-900 font-medium">{rule.successRate}%</div>
                          <div className="text-gray-500">Success Rate</div>
                        </div>
                        
                        <div className="flex gap-1 ml-4">
                          <Button variant="ghost" size="sm">
                            {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Smart Workflows</h2>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
              
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <motion.div
                    key={workflow.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                      <Badge className="bg-blue-100 text-blue-700">
                        {workflow.completionRate}% completion
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    <div className="flex items-center gap-2">
                      {workflow.templates.map((template, index) => (
                        <React.Fragment key={template}>
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{template}</span>
                          {index < workflow.templates.length - 1 && (
                            <span className="text-gray-400">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Automation Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Automations</p>
                      <p className="text-2xl font-bold text-green-900">12</p>
                    </div>
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold text-blue-900">91%</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Time Saved</p>
                      <p className="text-2xl font-bold text-purple-900">24h</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Morning Routine Auto-Start triggered</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Planning workflow completed</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 