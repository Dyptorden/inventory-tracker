import React from 'react';
import ItemsList from '../items/ItemsList';

const LeftPanel = ({
  items,
  sortBy,
  sortReverse,
  onSort,
  onAddItem,
  onItemModify,
  onItemDelete,
  onDragStart
}) => {
  return (
    <div className="left-panel">
      <div className="panel-header">Items</div>

      <div className="button-group">
        <button
          className="button button-primary"
          onClick={onAddItem}
        >
          Add an item
        </button>
      </div>

      <ItemsList
        items={items}
        sortBy={sortBy}
        sortReverse={sortReverse}
        onSort={onSort}
        onItemModify={onItemModify}
        onItemDelete={onItemDelete}
        onDragStart={onDragStart}
      />
    </div>
  );
};

export default LeftPanel;