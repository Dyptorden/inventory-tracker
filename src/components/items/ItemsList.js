import React, { useState, useRef, useEffect } from 'react';
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
  onItemRetrieve,
  onItemHistory,
  typeFilter,
  onTypeFilterChange
}) => {

  const itemTypes = ['HMI', 'Battery', 'Motor', 'Range Extender', 'Radar'];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const handleTypeToggle = (type) => {
    if (typeFilter.includes(type)) {
      // Remove type from filter
      onTypeFilterChange(typeFilter.filter(t => t !== type));
    } else {
      // Add type to filter
      onTypeFilterChange([...typeFilter, type]);
    }
  };

  const handleAllToggle = () => {
    if (typeFilter.length === itemTypes.length) {
      // If all are selected, unselect all
      onTypeFilterChange([]);
    } else {
      // If not all are selected, select all
      onTypeFilterChange([...itemTypes]);
    }
  };

  const isAllSelected = typeFilter.length === itemTypes.length;
  const isIndeterminate = typeFilter.length > 0 && typeFilter.length < itemTypes.length;

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Get display text for the filter button
  const getFilterDisplayText = () => {
    if (typeFilter.length === 0) {
      return 'No types selected';
    } else if (typeFilter.length === itemTypes.length) {
      return 'All types';
    } else if (typeFilter.length === 1) {
      return typeFilter[0];
    } else {
      return `${typeFilter.length} types selected`;
    }
  };
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

      {/* Filter and Sort Controls */}
      <div className="controls-row">
        {/* Type Filter */}
        <div className="filter-container" ref={filterRef}>
          <button
            className="filter-button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span>{getFilterDisplayText()}</span>
            <span className={`filter-arrow ${isFilterOpen ? 'open' : ''}`}>▼</span>
          </button>

          {isFilterOpen && (
            <div className="filter-dropdown">
              <div className="filter-header">Filter by Type:</div>
              <div className="checkbox-group">
                {/* All option */}
                <label className="checkbox-item checkbox-all">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleAllToggle}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label checkbox-label-all">All</span>
                </label>

                {/* Separator */}
                <div className="checkbox-separator"></div>

                {/* Individual types */}
                {itemTypes.map(type => (
                  <label key={type} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={typeFilter.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="sort-buttons">
          <button
            className={`button button-secondary ${sortBy === 'serial' ? 'active' : ''}`}
            onClick={() => onSort('serial')}
          >
            Serial {sortBy === 'serial' && (sortReverse ? '↓' : '↑')}
          </button>
          <button
            className={`button button-secondary ${sortBy === 'type' ? 'active' : ''}`}
            onClick={() => onSort('type')}
          >
            Type {sortBy === 'type' && (sortReverse ? '↓' : '↑')}
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
            onHistory={onItemHistory}
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