'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
    automationService, AutomationRule, CreateAutomationRule, UpdateAutomationRule,
    AutomationSuggestion, AutomationInsight, WorkflowExecutionResult
} from '@/lib/services/automationService';
import { useAuth } from '@/lib/providers/AuthContext';

// State interface
interface AutomationState {
    rules: AutomationRule[];
    suggestions: AutomationSuggestion[];
    insights: AutomationInsight[];
    executionHistory: WorkflowExecutionResult[];
    isLoading: boolean;
    error: string | null;
    selectedTemplateId: number | null;
    selectedRule: AutomationRule | null;
}

// Action types
type AutomationAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_RULES'; payload: AutomationRule[] }
    | { type: 'ADD_RULE'; payload: AutomationRule }
    | { type: 'UPDATE_RULE'; payload: AutomationRule }
    | { type: 'REMOVE_RULE'; payload: number }
    | { type: 'SET_SUGGESTIONS'; payload: AutomationSuggestion[] }
    | { type: 'SET_INSIGHTS'; payload: AutomationInsight[] }
    | { type: 'ADD_EXECUTION_HISTORY'; payload: WorkflowExecutionResult }
    | { type: 'SET_SELECTED_TEMPLATE'; payload: number | null }
    | { type: 'SET_SELECTED_RULE'; payload: AutomationRule | null }
    | { type: 'RESET' };

// Initial state
const initialState: AutomationState = {
    rules: [],
    suggestions: [],
    insights: [],
    executionHistory: [],
    isLoading: false,
    error: null,
    selectedTemplateId: null,
    selectedRule: null,
};

// Reducer
function automationReducer(state: AutomationState, action: AutomationAction): AutomationState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };

        case 'SET_RULES':
            return { ...state, rules: action.payload, isLoading: false };

        case 'ADD_RULE':
            return {
                ...state,
                rules: [...state.rules, action.payload],
                isLoading: false
            };

        case 'UPDATE_RULE':
            return {
                ...state,
                rules: state.rules.map(rule =>
                    rule.id === action.payload.id ? action.payload : rule
                ),
                selectedRule: state.selectedRule?.id === action.payload.id ? action.payload : state.selectedRule,
                isLoading: false
            };

        case 'REMOVE_RULE':
            return {
                ...state,
                rules: state.rules.filter(rule => rule.id !== action.payload),
                selectedRule: state.selectedRule?.id === action.payload ? null : state.selectedRule,
                isLoading: false
            };

        case 'SET_SUGGESTIONS':
            return { ...state, suggestions: action.payload };

        case 'SET_INSIGHTS':
            return { ...state, insights: action.payload };

        case 'ADD_EXECUTION_HISTORY':
            return {
                ...state,
                executionHistory: [action.payload, ...state.executionHistory].slice(0, 50) // Keep last 50
            };

        case 'SET_SELECTED_TEMPLATE':
            return { ...state, selectedTemplateId: action.payload };

        case 'SET_SELECTED_RULE':
            return { ...state, selectedRule: action.payload };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

// Context interface
interface AutomationContextType {
    state: AutomationState;

    // Rule management
    loadAutomationRules: (templateId: number) => Promise<void>;
    createAutomationRule: (rule: CreateAutomationRule) => Promise<AutomationRule>;
    updateAutomationRule: (ruleId: number, rule: UpdateAutomationRule) => Promise<AutomationRule>;
    deleteAutomationRule: (ruleId: number) => Promise<void>;

    // Trigger and execution
    evaluateAutomation: (triggerType: string) => Promise<AutomationRule[]>;
    executeAutomation: (ruleId: number, context?: Record<string, any>) => Promise<any>;
    processWorkflow: (templateId: number) => Promise<WorkflowExecutionResult>;

    // Pattern recognition
    analyzeUserPatterns: () => Promise<void>;
    loadAutomationInsights: () => Promise<void>;

    // UI state management
    setSelectedTemplate: (templateId: number | null) => void;
    setSelectedRule: (rule: AutomationRule | null) => void;

    // Utility functions
    getTriggerTypes: () => string[];
    getActionTypes: () => string[];

    // Error handling
    clearError: () => void;
}

// Create context
const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

// Provider component
interface AutomationProviderProps {
    children: ReactNode;
}

export function AutomationProvider({ children }: AutomationProviderProps) {
    const [state, dispatch] = useReducer(automationReducer, initialState);
    const { user } = useAuth();

    // Load user patterns and insights on mount
    useEffect(() => {
        if (user) {
            analyzeUserPatterns();
            loadAutomationInsights();
        }
    }, [user]);

    // Rule management functions
    const loadAutomationRules = async (templateId: number): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await automationService.getAutomationRules(templateId);

            if (response.data) {
                dispatch({ type: 'SET_RULES', payload: response.data });
                dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: templateId });
            }
        } catch (error) {
            console.error('Error loading automation rules:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load automation rules' });
        }
    };

    const createAutomationRule = async (rule: CreateAutomationRule): Promise<AutomationRule> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await automationService.createAutomationRule(rule);

            if (response.data) {
                dispatch({ type: 'ADD_RULE', payload: response.data });
                return response.data;
            }

            throw new Error('Failed to create automation rule');
        } catch (error) {
            console.error('Error creating automation rule:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create automation rule' });
            throw error;
        }
    };

    const updateAutomationRule = async (ruleId: number, rule: UpdateAutomationRule): Promise<AutomationRule> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await automationService.updateAutomationRule(ruleId, rule);

            if (response.data) {
                dispatch({ type: 'UPDATE_RULE', payload: response.data });
                return response.data;
            }

            throw new Error('Failed to update automation rule');
        } catch (error) {
            console.error('Error updating automation rule:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to update automation rule' });
            throw error;
        }
    };

    const deleteAutomationRule = async (ruleId: number): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            await automationService.deleteAutomationRule(ruleId);
            dispatch({ type: 'REMOVE_RULE', payload: ruleId });
        } catch (error) {
            console.error('Error deleting automation rule:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete automation rule' });
            throw error;
        }
    };

    // Trigger and execution functions
    const evaluateAutomation = async (triggerType: string): Promise<AutomationRule[]> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await automationService.evaluateAutomation(triggerType);

            if (response.data) {
                return response.data;
            }

            return [];
        } catch (error) {
            console.error('Error evaluating automation:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to evaluate automation' });
            return [];
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const executeAutomation = async (ruleId: number, context: Record<string, any> = {}): Promise<any> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await automationService.executeAutomation(ruleId, context);

            if (response.data) {
                return response.data;
            }

            throw new Error('Failed to execute automation');
        } catch (error) {
            console.error('Error executing automation:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to execute automation' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const processWorkflow = async (templateId: number): Promise<WorkflowExecutionResult> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await automationService.processWorkflow(templateId);

            if (response.data) {
                dispatch({ type: 'ADD_EXECUTION_HISTORY', payload: response.data });
                return response.data;
            }

            throw new Error('Failed to process workflow');
        } catch (error) {
            console.error('Error processing workflow:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to process workflow' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Pattern recognition functions
    const analyzeUserPatterns = async (): Promise<void> => {
        try {
            const response = await automationService.analyzeUserPatterns();

            if (response.data) {
                dispatch({ type: 'SET_SUGGESTIONS', payload: response.data });
            }
        } catch (error) {
            console.error('Error analyzing user patterns:', error);
            // Don't set error for this as it's background functionality
        }
    };

    const loadAutomationInsights = async (): Promise<void> => {
        try {
            const response = await automationService.getAutomationInsights();

            if (response.data) {
                dispatch({ type: 'SET_INSIGHTS', payload: response.data });
            }
        } catch (error) {
            console.error('Error loading automation insights:', error);
            // Don't set error for this as it's background functionality
        }
    };

    // UI state management
    const setSelectedTemplate = (templateId: number | null): void => {
        dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: templateId });
    };

    const setSelectedRule = (rule: AutomationRule | null): void => {
        dispatch({ type: 'SET_SELECTED_RULE', payload: rule });
    };

    // Utility functions
    const getTriggerTypes = (): string[] => {
        return automationService.getTriggerTypes();
    };

    const getActionTypes = (): string[] => {
        return automationService.getActionTypes();
    };

    // Error handling
    const clearError = (): void => {
        dispatch({ type: 'SET_ERROR', payload: null });
    };

    const value: AutomationContextType = {
        state,
        loadAutomationRules,
        createAutomationRule,
        updateAutomationRule,
        deleteAutomationRule,
        evaluateAutomation,
        executeAutomation,
        processWorkflow,
        analyzeUserPatterns,
        loadAutomationInsights,
        setSelectedTemplate,
        setSelectedRule,
        getTriggerTypes,
        getActionTypes,
        clearError,
    };

    return (
        <AutomationContext.Provider value={value}>
            {children}
        </AutomationContext.Provider>
    );
}

// Hook to use the automation context
export function useAutomation(): AutomationContextType {
    const context = useContext(AutomationContext);

    if (context === undefined) {
        throw new Error('useAutomation must be used within an AutomationProvider');
    }

    return context;
}

export default AutomationProvider; 