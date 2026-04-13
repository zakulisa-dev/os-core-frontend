import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../fileExplorer.module.css';

interface NewItemDialogProps {
  show: boolean;
  itemType: string;
  itemName: string;
  onTypeChange: (type: string) => void;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const NewItemDialog: FC<NewItemDialogProps> = ({
                                                        show,
                                                        itemType,
                                                        itemName,
                                                        onTypeChange,
                                                        onNameChange,
                                                        onConfirm,
                                                        onCancel,
                                                      }) => {
  if (!show) return null;

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3>Create New {itemType === 'folder' ? 'Folder' : 'File'}</h3>
          <button onClick={onCancel} className={styles.dialogClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.formGroup}>
            <label>Type:</label>
            <select value={itemType} onChange={(e) => onTypeChange(e.target.value)} className={styles.formSelect}>
              <option value="file">File</option>
              <option value="folder">Folder</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
              className={styles.formInput}
              placeholder={`Enter ${itemType} name`}
              autoFocus
            />
          </div>
        </div>
        <div className={styles.dialogFooter}>
          <button onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.btnCreate} disabled={!itemName.trim()}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

interface RenameDialogProps {
  item: { name: string; newName: string } | null;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RenameDialog: FC<RenameDialogProps> = ({ item, onNameChange, onConfirm, onCancel }) => {
  if (!item) return null;

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3>Rename Item</h3>
          <button onClick={onCancel} className={styles.dialogClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.formGroup}>
            <label>New name:</label>
            <input
              type="text"
              value={item.newName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
              className={styles.formInput}
              autoFocus
            />
          </div>
        </div>
        <div className={styles.dialogFooter}>
          <button onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.btnCreate} disabled={!item.newName?.trim()}>
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};