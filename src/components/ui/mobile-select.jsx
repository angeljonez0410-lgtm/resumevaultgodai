import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/components/hooks/useMediaQuery';

/**
 * MobileSelect - Uses drawer on mobile, dropdown on desktop
 * Drop-in replacement for Select component
 */
export function MobileSelect({ children, open, onOpenChange, value, onValueChange }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <SelectTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <SelectValue placeholder="Select..." />
          </Button>
        </SelectTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select an option</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-2">
            {React.Children.map(children, (child) => {
              if (child?.type?.displayName === 'SelectItem') {
                return (
                  <Button
                    key={child.props.value}
                    variant={value === child.props.value ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => {
                      onValueChange(child.props.value);
                      onOpenChange(false);
                    }}
                  >
                    {child.props.children}
                  </Button>
                );
              }
              return null;
            })}
          </div>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full mx-4 mb-4">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select open={open} onOpenChange={onOpenChange} value={value} onValueChange={onValueChange}>
      {children}
    </Select>
  );
}

export { SelectTrigger, SelectValue, SelectContent, SelectItem };