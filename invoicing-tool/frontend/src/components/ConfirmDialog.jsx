import React from 'react';
import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Löschen', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        {danger && (
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
        )}
        <div>
          <p className="text-gray-600 text-sm">{message}</p>
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={onClose} className="btn-secondary">Abbrechen</button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={danger ? 'btn-danger' : 'btn-primary'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
