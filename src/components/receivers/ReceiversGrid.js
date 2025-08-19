import React from 'react';
import ReceiverCell from './ReceiverCell';

const ReceiversGrid = ({
  receivers,
  onItemDrop,
  onReceiverModify,
  onReceiverDelete,
  onItemRemove
}) => {
  return (
    <div className="receiver-grid">
      {receivers.length === 0 ? (
        <div className="placeholder-receiver-card">
          No receivers added yet
        </div>
      ) : (
        receivers.map(receiver => (
          <ReceiverCell
            key={receiver.id}
            receiver={receiver}
            onItemDrop={onItemDrop}
            onModify={onReceiverModify}
            onDelete={onReceiverDelete}
            onItemRemove={onItemRemove}
          />
        ))
      )}
    </div>
  );
};

export default ReceiversGrid;