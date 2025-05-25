
// This component is likely deprecated as courses now have a single video/quiz
// directly on the course page, not a list of modules.
// Keeping the file to prevent build errors if it's imported somewhere,
// but it should be removed if no longer used.

import Link from 'next/link';
// import type { Module } from '@/lib/types'; // Module type is removed or will be
import { PlayCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ModuleListItemProps {
  // module: Module; // Module type might be removed
  module: { id: string, title: string, duration?: string }; // Generic module for now
  courseId: string;
  moduleNumber: number;
}

export function ModuleListItem({ module, courseId, moduleNumber }: ModuleListItemProps) {
  return (
    <div className="block group opacity-50 cursor-not-allowed" title="Module list items are deprecated.">
      <Card className="border-dashed border-muted-foreground">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mr-4" />
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">
                Module {moduleNumber}: {module.title} (Deprecated Structure)
              </h3>
              {module.duration && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> {module.duration}
                </p>
              )}
              <p className="text-xs text-destructive">This module structure is no longer primary. See course page.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
