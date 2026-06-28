import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Indonesian } from 'flatpickr/dist/l10n/id.js';

export default function DatePicker({ value, onChange, min, max, className = '', ...props }) {
    const inputRef = useRef(null);
    const fpRef = useRef(null);

    // Format Y-m-d to d/m/Y for flatpickr display
    const getDisplayValue = (val) => {
        if (!val) return '';
        const parts = val.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return val;
    };

    useEffect(() => {
        if (!inputRef.current) return;
        
        fpRef.current = flatpickr(inputRef.current, {
            locale: Indonesian,
            dateFormat: 'd/m/Y',
            defaultDate: value ? getDisplayValue(value) : null,
            minDate: min ? getDisplayValue(min) : null,
            maxDate: max ? getDisplayValue(max) : null,
            allowInput: true,
            onChange: (selectedDates) => {
                if (onChange) {
                    if (selectedDates.length > 0) {
                        const date = selectedDates[0];
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        onChange({ target: { value: `${y}-${m}-${d}` } });
                    } else {
                        onChange({ target: { value: '' } });
                    }
                }
            }
        });

        return () => {
            if (fpRef.current) {
                fpRef.current.destroy();
            }
        };
    }, []);

    // Effect to update flatpickr if value or constraints change externally
    useEffect(() => {
        if (fpRef.current && value !== undefined) {
            fpRef.current.setDate(value ? getDisplayValue(value) : null, false);
        }
    }, [value]);

    useEffect(() => {
        if (fpRef.current && min) fpRef.current.set('minDate', getDisplayValue(min));
    }, [min]);

    useEffect(() => {
        if (fpRef.current && max) fpRef.current.set('maxDate', getDisplayValue(max));
    }, [max]);

    return (
        <input 
            type="text" 
            ref={inputRef}
            className={`form-control ${className}`}
            defaultValue={getDisplayValue(value)}
            {...props}
        />
    );
}
