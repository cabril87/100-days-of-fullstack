/*
 * Primary Family Selector Component
 * Allows users to select and set their primary family
 * Copyright (c) 2025 Carlos Abril Jr
 */

import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, Loader2, Users, Crown } from 'lucide-react';
import { PrimaryFamilySelectorProps } from '@/lib/props/components/main.props';
import { cn } from '@/lib/helpers/utils/utils';

export function PrimaryFamilySelector({
  families,
  onSelectPrimary,
  isLoading = false,
  className,
  showRoleInfo = true
}: PrimaryFamilySelectorProps) {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSetPrimary = async () => {
    if (!selectedFamilyId) return;
    
    try {
      setIsUpdating(true);
      await onSelectPrimary(parseInt(selectedFamilyId));
      setSelectedFamilyId(''); // Reset selection
    } catch (error) {
      console.error('Failed to set primary family:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentPrimaryFamily = families.find(f => f.isPrimary);
  const availableFamilies = families.filter(f => f.canSetAsPrimary);

  if (families.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No families available</p>
      </div>
    );
  }

  if (families.length === 1) {
    const family = families[0];
    return (
      <div className={cn("flex items-center justify-between p-3 border rounded-lg", className)}>
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <div>
            <div className="font-medium">{family.name}</div>
            {showRoleInfo && (
              <div className="text-sm text-muted-foreground">{family.memberRole}</div>
            )}
          </div>
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Primary Family
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Primary Family Display */}
      {currentPrimaryFamily && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <div>
              <div className="font-medium">{currentPrimaryFamily.name}</div>
              {showRoleInfo && (
                <div className="text-sm text-muted-foreground">{currentPrimaryFamily.memberRole}</div>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            <Crown className="w-3 h-3 mr-1" />
            Primary
          </Badge>
        </div>
      )}

      {/* Family Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Select
            value={selectedFamilyId}
            onValueChange={setSelectedFamilyId}
            disabled={isLoading || isUpdating}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a family to set as primary" />
            </SelectTrigger>
            <SelectContent>
              {availableFamilies.map((family) => (
                <SelectItem 
                  key={family.id} 
                  value={family.id.toString()}
                  disabled={family.isPrimary}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {family.isPrimary && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      <span>{family.name}</span>
                    </div>
                    {showRoleInfo && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {family.memberRole}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSetPrimary}
            disabled={!selectedFamilyId || isLoading || isUpdating}
            size="sm"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Set Primary
              </>
            )}
          </Button>
        </div>

        {/* Family List with Primary Indicators */}
        {families.length > 1 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">All Your Families</div>
            {families.map((family) => (
              <div
                key={family.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded border-l-4",
                  family.isPrimary 
                    ? "border-l-yellow-500 bg-yellow-50/50" 
                    : "border-l-gray-200 bg-gray-50/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {family.isPrimary && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{family.name}</div>
                    {showRoleInfo && (
                      <div className="text-xs text-muted-foreground">{family.memberRole}</div>
                    )}
                  </div>
                </div>
                {family.isPrimary && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-yellow-700 border-yellow-300">
                    Primary
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrimaryFamilySelector; 
