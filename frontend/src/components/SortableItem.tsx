import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface Props {
  id: string;
  children: (props: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    setNodeRef: (node: HTMLElement | null) => void;
  }) => React.ReactNode;
}

export function SortableItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  // We apply the ref and style to the wrapper, but let the child decide where to put listeners
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners, setNodeRef })}
    </div>
  );
}
