import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppWidget, AppId } from '../../types';
import AppWidgetCard from './AppWidgetCard';

interface SortableWidgetCardProps {
  key?: React.Key;
  widget: AppWidget;
  onClick: (appId: AppId) => void;
  isCompact?: boolean;
  isCustomizing?: boolean;
  onTogglePin?: (id: string) => void;
}

export function SortableWidgetCard({
  widget,
  onClick,
  isCompact = false,
  isCustomizing = false,
  onTogglePin
}: SortableWidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: widget.id,
    disabled: !isCustomizing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <AppWidgetCard
        widget={widget}
        onClick={onClick}
        isCompact={isCompact}
        isCustomizing={isCustomizing}
        onTogglePin={onTogglePin}
      />
    </div>
  );
}
