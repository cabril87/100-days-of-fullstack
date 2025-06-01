'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  Wand2,
  Clock,
  Star,
  Target,
  Zap,
  Save,
  Eye,
  Grid3X3,
  List,
  PlayCircle,
  ChevronRight,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb,
  Award,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Template builder types
interface TemplateStep {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'checklist' | 'note' | 'timer' | 'automation';
  required: boolean;
  estimatedTime?: number;
  automationTrigger?: string;
  points?: number;
}

interface TemplateData {
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  tags: string[];
  steps: TemplateStep[];
  automationEnabled: boolean;
  pointReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function TemplateBuilderPage() {
  const router = useRouter();
  const { createTemplate } = useTemplates();
  const { userProgress } = useGamification();
  
  // Template data state
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: '',
    description: '',
    category: '',
    estimatedDuration: 30,
    tags: [],
    steps: [],
    automationEnabled: false,
    pointReward: 25,
    difficulty: 'medium'
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragMode, setIsDragMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const builderSteps = [
    { title: 'Basic Info', icon: Info },
    { title: 'Template Steps', icon: List },
    { title: 'Automation', icon: Zap },
    { title: 'Preview & Save', icon: Eye }
  ];

  // Add new template step
  const addTemplateStep = useCallback(() => {
    const newStep: TemplateStep = {
      id: `step-${Date.now()}`,
      title: '',
      description: '',
      type: 'task',
      required: false,
      estimatedTime: 10,
      points: 5
    };
    
    setTemplateData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  }, []);

  // Update template step
  const updateTemplateStep = useCallback((stepId: string, updates: Partial<TemplateStep>) => {
    setTemplateData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  }, []);

  // Remove template step
  const removeTemplateStep = useCallback((stepId: string) => {
    setTemplateData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  }, []);

  // Move step up/down
  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    setTemplateData(prev => {
      const steps = [...prev.steps];
      const index = steps.findIndex(s => s.id === stepId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      return { ...prev, steps };
    });
  }, []);

  // Validate template
  const validateTemplate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!templateData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!templateData.description.trim()) {
      newErrors.description = 'Template description is required';
    }
    
    if (templateData.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }
    
    templateData.steps.forEach((step, index) => {
      if (!step.title.trim()) {
        newErrors[`step-${index}-title`] = 'Step title is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [templateData]);

  // Save template
  const saveTemplate = useCallback(async () => {
    if (!validateTemplate()) {
      return;
    }
    
    setIsSaving(true);
    try {
      // Here you would call your template creation API
      console.log('Saving template:', templateData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Award gamification points for creating template
      router.push('/templates?created=true');
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  }, [templateData, validateTemplate, router]);

  // Step type options
  const stepTypeOptions = [
    { value: 'task', label: 'Task', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700' },
    { value: 'checklist', label: 'Checklist', icon: List, color: 'bg-green-100 text-green-700' },
    { value: 'note', label: 'Note', icon: Info, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'timer', label: 'Timer', icon: Clock, color: 'bg-purple-100 text-purple-700' },
    { value: 'automation', label: 'Automation', icon: Zap, color: 'bg-orange-100 text-orange-700' }
  ];

  // Template step component
  const TemplateStepCard = ({ step, index }: { step: TemplateStep; index: number }) => {
    const stepType = stepTypeOptions.find(opt => opt.value === step.type);
    
    return (
      <motion.div
        layout
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className={`p-2 rounded-lg ${stepType?.color || 'bg-gray-100'}`}>
              {stepType?.icon && <stepType.icon className="h-4 w-4" />}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Step title..."
                value={step.title}
                onChange={(e) => updateTemplateStep(step.id, { title: e.target.value })}
                className={cn(
                  "font-medium border-none p-0 text-base focus:ring-0 focus:border-none",
                  errors[`step-${index}-title`] && "text-red-600"
                )}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveStep(step.id, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveStep(step.id, 'down')}
                  disabled={index === templateData.steps.length - 1}
                >
                  ↓
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTemplateStep(step.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Step description..."
              value={step.description}
              onChange={(e) => updateTemplateStep(step.id, { description: e.target.value })}
              className="border-none p-0 resize-none focus:ring-0 focus:border-none"
              rows={2}
            />
            
            <div className="flex items-center gap-4 text-sm">
              <select
                value={step.type}
                onChange={(e) => updateTemplateStep(step.id, { type: e.target.value as any })}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {stepTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={step.required}
                  onChange={(e) => updateTemplateStep(step.id, { required: e.target.checked })}
                />
                Required
              </label>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                <Input
                  type="number"
                  value={step.estimatedTime || ''}
                  onChange={(e) => updateTemplateStep(step.id, { estimatedTime: parseInt(e.target.value) || 0 })}
                  className="w-16 h-6 text-xs"
                  placeholder="min"
                />
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <Input
                  type="number"
                  value={step.points || ''}
                  onChange={(e) => updateTemplateStep(step.id, { points: parseInt(e.target.value) || 0 })}
                  className="w-16 h-6 text-xs"
                  placeholder="pts"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <Input
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Morning Routine, Weekly Planning..."
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template helps accomplish..."
                rows={3}
                className={cn(errors.description && "border-red-500")}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={templateData.category}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select category...</option>
                  <option value="productivity">Productivity</option>
                  <option value="health">Health & Wellness</option>
                  <option value="work">Work & Business</option>
                  <option value="personal">Personal Development</option>
                  <option value="household">Household</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={templateData.difficulty}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={templateData.estimatedDuration}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point Reward
                </label>
                <Input
                  type="number"
                  value={templateData.pointReward}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, pointReward: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
            </div>
          </div>
        );
        
      case 1: // Template Steps
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Template Steps</h3>
              <Button onClick={addTemplateStep} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            
            {errors.steps && (
              <p className="text-red-500 text-sm">{errors.steps}</p>
            )}
            
            <AnimatePresence>
              {templateData.steps.map((step, index) => (
                <TemplateStepCard key={step.id} step={step} index={index} />
              ))}
            </AnimatePresence>
            
            {templateData.steps.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No steps yet</h3>
                <p className="text-gray-500 mb-4">Add steps to build your template workflow</p>
                <Button onClick={addTemplateStep} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            )}
          </div>
        );
        
      case 2: // Automation
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Automation Settings</h3>
              <Badge className="bg-purple-100 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                Smart Features
              </Badge>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={templateData.automationEnabled}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, automationEnabled: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Enable Smart Automation</div>
                  <div className="text-sm text-gray-600">
                    Automatically trigger tasks based on patterns and schedules
                  </div>
                </div>
              </label>
            </div>
            
            {templateData.automationEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-purple-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-trigger Conditions
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">Select trigger...</option>
                    <option value="daily">Daily at specific time</option>
                    <option value="weekly">Weekly on specific day</option>
                    <option value="completion">After completing other tasks</option>
                    <option value="pattern">Based on usage patterns</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Smart Suggestions</p>
                      <p>Based on your usage patterns, this template works best when triggered in the morning between 7-9 AM.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 3: // Preview & Save
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Preview & Save</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{templateData.name || 'Untitled Template'}</h4>
                  <p className="text-gray-600">{templateData.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {templateData.difficulty && (
                    <Badge variant="outline" className={cn(
                      templateData.difficulty === 'easy' && 'bg-green-50 text-green-700',
                      templateData.difficulty === 'medium' && 'bg-yellow-50 text-yellow-700',
                      templateData.difficulty === 'hard' && 'bg-red-50 text-red-700'
                    )}>
                      {templateData.difficulty}
                    </Badge>
                  )}
                  {templateData.automationEnabled && (
                    <Badge className="bg-purple-100 text-purple-700">
                      <Zap className="h-3 w-3 mr-1" />
                      Automated
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold">{templateData.estimatedDuration}m</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Reward</div>
                  <div className="font-semibold">{templateData.pointReward} pts</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <List className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Steps</div>
                  <div className="font-semibold">{templateData.steps.length}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Template Steps:</h5>
                {templateData.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.title}</div>
                      {step.description && (
                        <div className="text-sm text-gray-600">{step.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {step.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.estimatedTime}m
                        </span>
                      )}
                      {step.points && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {step.points}
                        </span>
                      )}
                      {step.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

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
                Template Builder
              </h1>
              <p className="text-gray-600 mt-1">Create smart, automated task templates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              onClick={saveTemplate}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            {builderSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                    currentStep === index
                      ? "bg-blue-100 text-blue-700"
                      : currentStep > index
                      ? "bg-green-100 text-green-700"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    currentStep === index
                      ? "bg-blue-600 text-white"
                      : currentStep > index
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {currentStep > index ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </button>
                
                {index < builderSteps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            {renderStepContent()}
          </div>
          
          {/* Navigation buttons */}
          <div className="border-t border-gray-200 p-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-3">
              {currentStep < builderSteps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(builderSteps.length - 1, currentStep + 1))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={saveTemplate}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Template
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Gamification incentive */}
        {userProgress && (
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Template Creation Reward
                </h3>
                <p className="text-purple-100">
                  Create this template to earn <strong>+50 points</strong> and unlock the "Template Creator" achievement!
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">+50</div>
                <div className="text-purple-200 text-sm">Points</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 