import Link from 'next/link';
import type { Module } from '@/lib/types';
import { PlayCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ModuleListItemProps {
  module: Module;
  courseId: string;
  moduleNumber: number;
}

export function ModuleListItem({ module, courseId, moduleNumber }: ModuleListItemProps) {
  return (
    <Link href={`/courses/${courseId}/${module.id}`} className="block group">
      <Card className="hover:shadow-lg hover:border-primary transition-all duration-200 ease-in-out transform hover:scale-[1.01]">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <PlayCircle className="h-10 w-10 text-primary mr-4 group-hover:text-accent transition-colors" />
            <div>
              <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                Module {moduleNumber}: {module.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> {module.duration}
              </p>
            </div>
          </div>
          {/* Add a small arrow or chevron to indicate clickable */}
        </CardContent>
      </Card>
    </Link>
  );
}
