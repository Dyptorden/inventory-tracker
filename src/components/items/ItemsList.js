import React from 'react';
import DraggableItem from './DraggableItem';

const ItemsList = ({
  items,
  onItemModify,
  onItemDelete,
  onDragStart,
  sortBy,
  sortReverse,
  onSort
}) => {
  return (
    <div>
      <div className="button-group">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`button button-secondary ${sortBy === 'serial' ? 'active' : ''}`}
            onClick={() => onSort('serial')}
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
          >
            Sort by serial {sortBy === 'serial' && (sortReverse ? '↓' : '↑')}
          </button>
          <button
            className={`button button-secondary ${sortBy === 'type' ? 'active' : ''}`}
            onClick={() => onSort('type')}
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
          >
            Sort by type {sortBy === 'type' && (sortReverse ? '↓' : '↑')}
          </button>
        </div>
      </div>

      <div className="items-container">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onModify={onItemModify}
            onDelete={onItemDelete}
            onDragStart={onDragStart}
          />
        ))}
        {items.length === 0 && (
          <div className="empty-state">
            No items in inventory
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsList;