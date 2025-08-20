import React from 'react';
import DraggableItem from './DraggableItem';

const ItemsList = ({
  items,
  onItemModify,
  onItemDelete,
  onDragStart,
  sortBy,
  sortReverse,
  onSort,
  showUnassignedOnly,
  onToggleUnassigned,
  onItemHover,
  onItemHoverEnd,
  onItemRetrieve
}) => {
  return (
    <div>
      {/* Unassigned Toggle */}
      <div className="toggle-container">
        <span className="toggle-label">Unassigned</span>
        <div
          className={`toggle-switch ${showUnassignedOnly ? 'active' : ''}`}
          onClick={onToggleUnassigned}
        >
        </div>
      </div>

      {/* Sort Buttons */}
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

      {/* Items Container */}
      <div className="items-container">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onModify={onItemModify}
            onDelete={onItemDelete}
            onDragStart={onDragStart}
            onHover={onItemHover}
            onHoverEnd={onItemHoverEnd}
            onRetrieve={onItemRetrieve}
          />
        ))}
        {items.length === 0 && (
          <div className="empty-state">
            {showUnassignedOnly ? 'No unassigned items' : 'No items in inventory'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsList;