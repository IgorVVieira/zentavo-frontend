'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import type { Category, CreateCategoryRequest } from '../../../lib/categories';
import ColorPicker from './ColorPicker';
import { useToast } from '../../../components/ToastProvider';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  category?: Category | null;
}

export default function CategoryFormDialog({
  open,
  onClose,
  onSubmit,
  category,
}: CategoryFormDialogProps) {
  const { showToast } = useToast();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('#FF5733');
  const [type, setType] = React.useState<'CASH_IN' | 'CASH_OUT' | ''>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [colorError, setColorError] = React.useState('');

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setType(category.type ?? '');
    } else {
      setName('');
      setColor('#FF5733');
      setType('');
    }
    setError('');
    setNameError('');
    setColorError('');
  }, [category, open]);

  const validate = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('O nome e obrigatorio.');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!color.trim()) {
      setColorError('A cor e obrigatoria.');
      isValid = false;
    } else {
      setColorError('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        name: name.trim(),
        color: color.trim(),
        type: type || null,
      });
      showToast({ message: isEditing ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!' });
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Erro ao salvar categoria.');
      } else {
        setError('Erro de conexao. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!category;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            required
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            fullWidth
          />
          <ColorPicker
            value={color}
            onChange={(c) => setColor(c)}
            error={!!colorError}
            helperText={colorError}
          />
          <FormControl fullWidth>
            <InputLabel id="category-type-label">Tipo</InputLabel>
            <Select
              labelId="category-type-label"
              value={type}
              onChange={(e: SelectChangeEvent) =>
                setType(e.target.value as 'CASH_IN' | 'CASH_OUT' | '')
              }
              label="Tipo"
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              <MenuItem value="CASH_IN">Entrada</MenuItem>
              <MenuItem value="CASH_OUT">Saida</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
