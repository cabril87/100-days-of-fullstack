'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Brain,
    Target,
    BarChart3,
    History,
    Settings,
    Plus,
    Timer
} from 'lucide-react';

import { toast } from 'sonner';

// Enterprise components
import FocusSessionManager from '@/components/focus/FocusSessionManager';
import TaskSelectionModal from '@/components/focus/TaskSelectionModal';

// Enterprise types
import type {
    FocusSession,
    FocusSessionState,
    TaskItem,
    CreateFocusSessionDTO
} from '@/lib/types/focus';

// Enterprise services
import { focusService } from '@/lib/services/focusService';
import { useAuth } from '@/lib/providers/AuthProvider';

/**
 * Focus Page Client Component
 * Main focus sessions interface with session management and analytics
 * Integrates focus session manager with task selection workflow
 */
export default function FocusPageClient() {

    // ============================================================================
    // AUTHENTICATION & STATE
    // ============================================================================

    const { user } = useAuth();
    const [focusState, setFocusState] = useState<FocusSessionState>('NO_SESSION');
    const [showTaskSelection, setShowTaskSelection] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleSessionStateChange = useCallback((state: FocusSessionState) => {
        setFocusState(state);
        console.log('🎯 FocusPage: Session state changed to:', state);
    }, []);

    const handleSessionComplete = useCallback((session: FocusSession) => {
        console.log('🎉 FocusPage: Session completed:', session);
        toast.success(`🎉 Great focus session! You focused for ${session.durationMinutes} minutes.`);
    }, []);

    const handleStartNewSession = useCallback(() => {
        setShowTaskSelection(true);
    }, []);

    const handleTaskSelect = useCallback(async (task: TaskItem, createDto: CreateFocusSessionDTO) => {
        setIsLoading(true);
        try {
            console.log('🚀 FocusPage: Starting session for task:', task.title);
            await focusService.startSession(createDto);

            setShowTaskSelection(false);
            setFocusState('IN_PROGRESS');

            toast.success(`🎯 Focus session started for: ${task.title}`);
            console.log('✅ FocusPage: Session started successfully');
        } catch (error) {
            console.error('❌ FocusPage: Failed to start session:', error);
            toast.error('Failed to start focus session');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    const getWelcomeMessage = useCallback(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning! Ready to focus?";
        if (hour < 17) return "Good afternoon! Time to get in the zone?";
        return "Good evening! Let&apos;s finish strong!";
    }, []);

    const getStateDescription = useCallback(() => {
        switch (focusState) {
            case 'NO_SESSION':
                return "Start a new focus session by selecting a task to work on.";
            case 'STARTING':
                return "Preparing your focus environment...";
            case 'IN_PROGRESS':
                return "You&apos;re in the zone! Stay focused on your current task.";
            case 'PAUSED':
                return "Session is paused. Take a break and resume when ready.";
            case 'COMPLETING':
                return "Wrapping up your session...";
            case 'ERROR':
                return "Something went wrong. Please try starting a new session.";
            default:
                return "Focus mode helps you stay productive and track your progress.";
        }
    }, [focusState]);

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Focus Sessions</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {getWelcomeMessage()}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                    {getStateDescription()}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Focus Session Manager - Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <FocusSessionManager
                        userId={user?.id}
                        showTaskDetails={true}
                        showStreakCounter={true}
                        showKeyboardHelp={true}
                        onSessionStateChange={handleSessionStateChange}
                        onSessionComplete={handleSessionComplete}
                        className="h-fit"
                    />

                    {/* Quick Actions */}
                    {focusState === 'NO_SESSION' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5 text-green-600" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button
                                        onClick={handleStartNewSession}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 justify-start"
                                        disabled={isLoading}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Select Task & Start
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => toast.info('Pomodoro Timer coming soon!')}
                                    >
                                        <Timer className="h-4 w-4 mr-2" />
                                        Quick Pomodoro
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Analytics & Info */}
                <div className="space-y-6">

                    {/* Today's Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Today&apos;s Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">0</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Sessions</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">0m</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Focused</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Daily Goal</span>
                                    <span className="text-gray-500">0 / 120 min</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-0"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Focus Streak */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="text-orange-600">🔥</div>
                                Focus Streak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                            <div className="text-3xl font-bold text-orange-600">3</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Days in a row
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Keep it up! 🎯
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Quick Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings className="h-5 w-5 text-gray-600" />
                                Focus Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm space-y-2">
                                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200">
                                    💡 Start with 25-minute sessions (Pomodoro technique)
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-800 dark:text-blue-200">
                                    🎯 Choose one specific task per session
                                </div>
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-800 dark:text-green-200">
                                    🔔 Turn off notifications during focus time
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <History className="h-5 w-5 text-purple-600" />
                                Recent Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 text-gray-500">
                                <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No sessions yet</p>
                                <p className="text-xs">Start your first focus session!</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Task Selection Modal */}
            <TaskSelectionModal
                open={showTaskSelection}
                onOpenChange={setShowTaskSelection}
                onTaskSelect={handleTaskSelect}
                userId={user?.id}
            />
        </div>
    );
} 