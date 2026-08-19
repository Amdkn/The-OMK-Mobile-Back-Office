import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppDefinition } from '../types';

interface Props {
  app: AppDefinition;
  onClick: () => void;
}

export function SortableAppIcon({ app, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group relative touch-none"
    >
      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${app.color} shadow-lg transition-transform`}>
        <app.icon size={26} strokeWidth={1.5} />
      </div>
      <span className="text-[10px] font-medium text-slate-300 text-center leading-tight truncate w-14">{app.name}</span>
    </button>
  );
}
