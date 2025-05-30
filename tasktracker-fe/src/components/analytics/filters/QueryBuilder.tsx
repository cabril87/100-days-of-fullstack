'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { savedFiltersService } from '@/lib/services/analytics';
import type { QueryBuilder as QueryBuilderType, QueryField, FilterCriteria } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DatabaseIcon, 
  PlusIcon, 
  PlayIcon, 
  XIcon,
  CodeIcon,
  BracketsIcon,
  SearchIcon
} from 'lucide-react';

interface QueryRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector: 'AND' | 'OR';
}

interface QueryBuilderProps {
  className?: string;
  onQueryExecute?: (query: string, criteria: FilterCriteria) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  className = '',
  onQueryExecute
}) => {
  const [rules, setRules] = useState<QueryRule[]>([]);
  const [queryText, setQueryText] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<QueryBuilderType | null>(null);

  // Mock query schema
  const mockSchema: QueryBuilderType = {
    availableFields: [
      { name: 'title', label: 'Task Title', type: 'string' },
      { name: 'status', label: 'Status', type: 'string', options: ['Todo', 'InProgress', 'Completed', 'Cancelled'] },
      { name: 'priority', label: 'Priority', type: 'number', options: ['1', '2', '3', '4'] },
      { name: 'category', label: 'Category', type: 'string', options: ['Work', 'Personal', 'Family', 'Health'] },
      { name: 'dueDate', label: 'Due Date', type: 'date' },
      { name: 'createdAt', label: 'Created Date', type: 'date' },
      { name: 'completedAt', label: 'Completed Date', type: 'date' },
      { name: 'assignedTo', label: 'Assigned To', type: 'string' },
      { name: 'tags', label: 'Tags', type: 'array' }
    ],
    filterTypes: [
      { name: 'text', label: 'Text Filter', component: 'input' },
      { name: 'select', label: 'Select Filter', component: 'select' },
      { name: 'date', label: 'Date Filter', component: 'date' },
      { name: 'number', label: 'Number Filter', component: 'number' }
    ],
    operatorTypes: [
      { name: 'equals', label: 'Equals', applicableTypes: ['string', 'number'] },
      { name: 'contains', label: 'Contains', applicableTypes: ['string'] },
      { name: 'startsWith', label: 'Starts With', applicableTypes: ['string'] },
      { name: 'endsWith', label: 'Ends With', applicableTypes: ['string'] },
      { name: 'greaterThan', label: 'Greater Than', applicableTypes: ['number', 'date'] },
      { name: 'lessThan', label: 'Less Than', applicableTypes: ['number', 'date'] },
      { name: 'between', label: 'Between', applicableTypes: ['number', 'date'] },
      { name: 'in', label: 'In', applicableTypes: ['array'] },
      { name: 'notIn', label: 'Not In', applicableTypes: ['array'] }
    ],
    defaultValues: {}
  };

  useEffect(() => {
    setSchema(mockSchema);
  }, []);

  // Add a new query rule
  const addRule = () => {
    const newRule: QueryRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: '',
      value: '',
      connector: 'AND'
    };
    setRules([...rules, newRule]);
  };

  // Remove a query rule
  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // Update a rule
  const updateRule = (id: string, updates: Partial<QueryRule>) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  // Get available operators for a field type
  const getOperatorsForField = (fieldName: string) => {
    if (!schema) return [];
    
    const field = schema.availableFields.find(f => f.name === fieldName);
    if (!field) return [];
    
    return schema.operatorTypes.filter(op => 
      op.applicableTypes.includes(field.type)
    );
  };

  // Generate SQL-like query from rules
  const generateQuery = () => {
    if (rules.length === 0) return '';
    
    const conditions = rules.map((rule, index) => {
      if (!rule.field || !rule.operator || !rule.value) return '';
      
      const field = schema?.availableFields.find(f => f.name === rule.field);
      let condition = '';
      
      switch (rule.operator) {
        case 'equals':
          condition = `${rule.field} = '${rule.value}'`;
          break;
        case 'contains':
          condition = `${rule.field} LIKE '%${rule.value}%'`;
          break;
        case 'startsWith':
          condition = `${rule.field} LIKE '${rule.value}%'`;
          break;
        case 'endsWith':
          condition = `${rule.field} LIKE '%${rule.value}'`;
          break;
        case 'greaterThan':
          condition = `${rule.field} > '${rule.value}'`;
          break;
        case 'lessThan':
          condition = `${rule.field} < '${rule.value}'`;
          break;
        case 'in':
          condition = `${rule.field} IN (${rule.value.split(',').map(v => `'${v.trim()}'`).join(', ')})`;
          break;
        default:
          condition = `${rule.field} ${rule.operator} '${rule.value}'`;
      }
      
      if (index === 0) return condition;
      return `${rule.connector} ${condition}`;
    }).filter(Boolean);
    
    return `SELECT * FROM tasks WHERE ${conditions.join(' ')}`;
  };

  // Convert rules to FilterCriteria
  const rulesToCriteria = (): FilterCriteria => {
    const criteria: FilterCriteria = {};
    
    rules.forEach(rule => {
      if (!rule.field || !rule.value) return;
      
      switch (rule.field) {
        case 'status':
          if (!criteria.status) criteria.status = [];
          criteria.status.push(rule.value);
          break;
        case 'priority':
          if (!criteria.priority) criteria.priority = [];
          criteria.priority.push(parseInt(rule.value));
          break;
        case 'category':
          if (!criteria.categories) criteria.categories = [];
          criteria.categories.push(rule.value);
          break;
        case 'tags':
          if (!criteria.tags) criteria.tags = [];
          criteria.tags.push(...rule.value.split(',').map(t => t.trim()));
          break;
      }
    });
    
    return criteria;
  };

  // Execute query
  const executeQuery = () => {
    const query = isRawMode ? queryText : generateQuery();
    const criteria = isRawMode ? {} : rulesToCriteria();
    
    if (onQueryExecute) {
      onQueryExecute(query, criteria);
    }
  };

  // Validate query
  const isQueryValid = () => {
    if (isRawMode) {
      return queryText.trim().length > 0;
    }
    return rules.some(rule => rule.field && rule.operator && rule.value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Query Builder
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsRawMode(!isRawMode)}
              variant="outline"
              size="sm"
            >
              {isRawMode ? <BracketsIcon className="h-4 w-4 mr-2" /> : <CodeIcon className="h-4 w-4 mr-2" />}
              {isRawMode ? 'Visual Builder' : 'Raw SQL'}
            </Button>
            
            <Button
              onClick={executeQuery}
              disabled={!isQueryValid() || loading}
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isRawMode ? (
          // Raw SQL mode
          <div className="space-y-4">
            <div>
              <Label htmlFor="query-text">SQL Query</Label>
              <Textarea
                id="query-text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="SELECT * FROM tasks WHERE..."
                className="font-mono text-sm"
                rows={8}
              />
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Available tables: tasks, users, categories</p>
              <p>Common fields: id, title, description, status, priority, category, dueDate, createdAt, assignedTo</p>
            </div>
          </div>
        ) : (
          // Visual builder mode
          <div className="space-y-4">
            {/* Query rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Query Conditions</Label>
                <Button onClick={addRule} variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              {rules.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <DatabaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No conditions added yet</p>
                  <p className="text-sm">Click "Add Condition" to start building your query</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <Card key={rule.id} className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        {/* Connector (for rules after the first) */}
                        {index > 0 && (
                          <div className="col-span-1">
                            <Select
                              value={rule.connector}
                              onValueChange={(value: 'AND' | 'OR') => updateRule(rule.id, { connector: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Field selector */}
                        <div className={index === 0 ? "col-span-3" : "col-span-2"}>
                          <Select
                            value={rule.field}
                            onValueChange={(value) => updateRule(rule.id, { field: value, operator: '', value: '' })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {schema?.availableFields.map(field => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Operator selector */}
                        <div className="col-span-3">
                          <Select
                            value={rule.operator}
                            onValueChange={(value) => updateRule(rule.id, { operator: value })}
                            disabled={!rule.field}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperatorsForField(rule.field).map(op => (
                                <SelectItem key={op.name} value={op.name}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value input */}
                        <div className="col-span-4">
                          {(() => {
                            const field = schema?.availableFields.find(f => f.name === rule.field);
                            
                            if (field?.options) {
                              return (
                                <Select
                                  value={rule.value}
                                  onValueChange={(value) => updateRule(rule.id, { value })}
                                  disabled={!rule.operator}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select value" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map(option => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            }
                            
                            return (
                              <Input
                                value={rule.value}
                                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                placeholder="Enter value"
                                disabled={!rule.operator}
                                type={field?.type === 'number' ? 'number' : 
                                      field?.type === 'date' ? 'date' : 'text'}
                              />
                            );
                          })()}
                        </div>

                        {/* Remove button */}
                        <div className="col-span-1">
                          <Button
                            onClick={() => removeRule(rule.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Generated query preview */}
            {rules.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Generated Query</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  <code className="text-sm text-gray-800">
                    {generateQuery() || 'No valid conditions'}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Query statistics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isRawMode ? (queryText.length > 0 ? 1 : 0) : rules.length}
            </div>
            <div className="text-sm text-gray-600">
              {isRawMode ? 'Queries' : 'Conditions'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {schema?.availableFields.length || 0}
            </div>
            <div className="text-sm text-gray-600">Available Fields</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {schema?.operatorTypes.length || 0}
            </div>
            <div className="text-sm text-gray-600">Operators</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryBuilder; 