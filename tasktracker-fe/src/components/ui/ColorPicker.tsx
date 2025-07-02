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

import React from 'react';
import { cn } from '@/lib/helpers/utils/utils';
import { Button } from './button';
import { Check } from 'lucide-react';

const GRADIENT_PRESETS = [
  { name: 'Ocean Blue', value: 'from-blue-500 to-cyan-600', gradient: 'from-blue-500 to-cyan-600' },
  { name: 'Forest Green', value: 'from-emerald-500 to-teal-600', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Purple Magic', value: 'from-purple-500 to-pink-600', gradient: 'from-purple-500 to-pink-600' },
  { name: 'Sunset Orange', value: 'from-orange-500 to-red-600', gradient: 'from-orange-500 to-red-600' },
  { name: 'Rose Gold', value: 'from-pink-500 to-rose-600', gradient: 'from-pink-500 to-rose-600' },
  { name: 'Arctic Mint', value: 'from-cyan-500 to-blue-600', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Golden Hour', value: 'from-amber-500 to-orange-600', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Lavender Dream', value: 'from-violet-500 to-purple-600', gradient: 'from-violet-500 to-purple-600' },
  { name: 'Emerald Shine', value: 'from-green-500 to-emerald-600', gradient: 'from-green-500 to-emerald-600' },
  { name: 'Ruby Red', value: 'from-red-500 to-pink-600', gradient: 'from-red-500 to-pink-600' },
  { name: 'Slate Storm', value: 'from-slate-500 to-gray-600', gradient: 'from-slate-500 to-gray-600' },
  { name: 'Indigo Night', value: 'from-indigo-500 to-blue-600', gradient: 'from-indigo-500 to-blue-600' },
  { name: 'Lime Fresh', value: 'from-lime-500 to-green-600', gradient: 'from-lime-500 to-green-600' },
  { name: 'Cherry Blossom', value: 'from-pink-400 to-rose-500', gradient: 'from-pink-400 to-rose-500' },
  { name: 'Deep Sea', value: 'from-teal-600 to-cyan-700', gradient: 'from-teal-600 to-cyan-700' }
];

interface ColorPickerProps {
  selectedColor?: string;
  onColorSelect: (gradient: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  className
}) => {
  return (
    <div className={cn("grid grid-cols-5 gap-2 p-4", className)}>
      {GRADIENT_PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant="ghost"
          size="sm"
          className={cn(
            "relative w-12 h-12 p-0 rounded-lg overflow-hidden transition-all duration-200",
            "hover:scale-110 hover:shadow-lg border-2 border-transparent",
            selectedColor === preset.value && "ring-2 ring-blue-500 ring-offset-2 ring-offset-background scale-110 shadow-lg border-white"
          )}
          onClick={() => onColorSelect(preset.value)}
          title={preset.name}
        >
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              preset.gradient
            )}
          />
          {selectedColor === preset.value && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 rounded-lg">
              <Check className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
          )}
        </Button>
      ))}
    </div>
  );
}; 
