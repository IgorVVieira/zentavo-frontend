'use client';

import * as React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useForkRef } from '@mui/material/utils';
import Button from '@mui/material/Button';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, type DatePickerFieldProps } from '@mui/x-date-pickers/DatePicker';
import {
  usePickerContext,
  useSplitFieldProps,
  useParsedFormat,
} from '@mui/x-date-pickers';

dayjs.locale('pt-br');

function ButtonField(props: DatePickerFieldProps) {
  const { forwardedProps } = useSplitFieldProps(props, 'date');
  const pickerContext = usePickerContext();
  const handleRef = useForkRef(pickerContext.triggerRef, pickerContext.rootRef);
  const parsedFormat = useParsedFormat();
  const valueStr =
    pickerContext.value == null
      ? parsedFormat
      : pickerContext.value.format(pickerContext.fieldFormat);

  return (
    <Button
      {...forwardedProps}
      variant="outlined"
      ref={handleRef}
      size="small"
      startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
      sx={{ minWidth: 'fit-content', textTransform: 'capitalize' }}
      onClick={() => pickerContext.setOpen((prev) => !prev)}
    >
      {pickerContext.label ?? valueStr}
    </Button>
  );
}

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  disabled?: boolean;
}

export default function MonthYearPicker({ month, year, onChange, disabled }: MonthYearPickerProps) {
  const value = React.useMemo(() => dayjs().year(year).month(month - 1), [month, year]);

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue) {
      onChange(newValue.month() + 1, newValue.year());
    }
  };

  const label = value.format('MMM YYYY');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <DatePicker
        value={value}
        label={label}
        onChange={handleChange}
        disabled={disabled}
        slots={{ field: ButtonField }}
        slotProps={{
          nextIconButton: { size: 'small' },
          previousIconButton: { size: 'small' },
        }}
        views={['month', 'year']}
        openTo="month"
      />
    </LocalizationProvider>
  );
}
