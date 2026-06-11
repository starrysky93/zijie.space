import React from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import type { HistoryItem } from '../hooks/useCalculator';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onLoadItem,
  onClearHistory,
}) => {
  return (
    <div className={`history-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="history-header">
        <h3>計算歷史</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {history.length > 0 && (
            <button
              className="icon-btn"
              onClick={onClearHistory}
              title="清除所有歷史紀錄"
              aria-label="Clear history"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            className="icon-btn"
            onClick={onClose}
            title="關閉歷史紀錄"
            aria-label="Close history"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">
            <Clock size={32} />
            <span>暫無歷史紀錄</span>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="history-item"
              onClick={() => onLoadItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onLoadItem(item);
                }
              }}
              aria-label={`Formula: ${item.formula}, Result: ${item.result}`}
            >
              <span className="history-item-time">{item.timestamp}</span>
              <span className="history-item-formula">{item.formula}</span>
              <span className="history-item-result">={item.result}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryDrawer;
