'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { fmtXOF } from '@/lib/utils/currency';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: number[];
  onChange: (value: number[]) => void;
}

export default function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{fmtXOF(value[0])}</span>
        <span>{fmtXOF(value[1])}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={10}
        value={value}
        onValueChange={onChange}
        className="w-full"
      />
    </div>
  );
}
