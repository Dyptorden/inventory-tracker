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
  onDragStart,
  showUnassignedOnly,
  onToggleUnassigned,
  onItemHover,
  onItemHoverEnd,
  onItemRetrieve,
  onItemHistory,
  typeFilter,
  onTypeFilterChange
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
        showUnassignedOnly={showUnassignedOnly}
        onToggleUnassigned={onToggleUnassigned}
        onItemHover={onItemHover}
        onItemHoverEnd={onItemHoverEnd}
        onItemRetrieve={onItemRetrieve}
        onItemHistory={onItemHistory}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
      />
    </div>
  );
};

export default LeftPanel;