import React from 'react';
import ReceiversGrid from '../receivers/ReceiversGrid';

const RightPanel = ({
  receivers,
  onAddReceiver,
  onItemDrop,
  onReceiverModify,
  onReceiverDelete,
  onItemRemove,
  backgroundImage,
  highlightedReceiverId
}) => {
  const panelStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
  } : {};

  const panelClass = backgroundImage
    ? "right-panel with-background"
    : "right-panel";

  return (
    <div className={panelClass} style={panelStyle}>
      <div style={{ marginBottom: '1rem' }}>
        <div className="panel-header">Receivers</div>
        <button
          className="button button-green"
          onClick={onAddReceiver}
        >
          Add Receivers
        </button>
      </div>

      <ReceiversGrid
        receivers={receivers}
        onItemDrop={onItemDrop}
        onReceiverModify={onReceiverModify}
        onReceiverDelete={onReceiverDelete}
        onItemRemove={onItemRemove}
        highlightedReceiverId={highlightedReceiverId}
      />
    </div>
  );
};

export default RightPanel;