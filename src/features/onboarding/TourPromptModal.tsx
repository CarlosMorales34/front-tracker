'use client';

import { Modal } from '../../shared/components/ui/Modal';
import uiStyles from '../../shared/components/ui/ui.module.css';

interface TourPromptModalProps {
  title: string;
  description: string;
  acceptLabel: string;
  onAccept: () => void;
  onSkip: () => void;
}

export function TourPromptModal({ title, description, acceptLabel, onAccept, onSkip }: TourPromptModalProps) {
  return (
    <Modal title={title} onClose={onSkip}>
      <div className={uiStyles.modalForm}>
        <p className={uiStyles.cardNote}>{description}</p>
        <div className={uiStyles.modalActions}>
          <button type="button" className={uiStyles.modalCancelButton} onClick={onSkip}>
            Ahora no
          </button>
          <button type="button" className={uiStyles.modalPrimaryButton} onClick={onAccept}>
            {acceptLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
