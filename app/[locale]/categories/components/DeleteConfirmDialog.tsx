'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  categoryName: string;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
  categoryName,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('categories');
  const tc = useTranslations('common');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t.rich('deleteConfirm', {
            name: categoryName,
            bold: (chunks) => <strong>{chunks}</strong>,
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : tc('actions.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
