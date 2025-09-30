import React from 'react';
import { Clock, X } from 'lucide-react';

interface OperatingHoursProps {
  value?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  onChange: (value: OperatingHoursProps['value']) => void;
  error?: string;
  disabled?: boolean;
}

const OperatingHours: React.FC<OperatingHoursProps> = ({
  value = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: false }
  },
  onChange,
  error,
  disabled = false
}) => {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ] as const;

  const handleDayChange = (day: typeof days[0]['key'], field: 'open' | 'close' | 'closed', newValue: string | boolean) => {
    const updatedValue = {
      ...value,
      [day]: {
        ...value[day],
        [field]: newValue
      }
    };
    onChange(updatedValue);
  };

  const handleSetAllDays = (open: string, close: string, closed: boolean) => {
    const updatedValue = { ...value };
    days.forEach(day => {
      updatedValue[day.key] = { open, close, closed };
    });
    onChange(updatedValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Operating Hours
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleSetAllDays('09:00', '18:00', false)}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            Set All Open
          </button>
          <button
            type="button"
            onClick={() => handleSetAllDays('00:00', '00:00', true)}
            disabled={disabled}
            className="text-xs text-red-600 hover:text-red-700 disabled:text-gray-400"
          >
            Set All Closed
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {days.map(day => (
          <div key={day.key} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-20 text-sm font-medium text-gray-700">
              {day.label}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value[day.key].closed}
                onChange={(e) => handleDayChange(day.key, 'closed', e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Closed</span>
            </div>

            {!value[day.key].closed && (
              <>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    value={value[day.key].open}
                    onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                    disabled={disabled}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                
                <span className="text-gray-400">to</span>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    value={value[day.key].close}
                    onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                    disabled={disabled}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default OperatingHours;
