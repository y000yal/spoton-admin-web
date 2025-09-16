import React from 'react';
import { Trophy } from 'lucide-react';
import GenericSearchInput from './GenericSearchInput';
import { useSportSearch } from '../hooks/useSportSearch';
import type { Sport } from '../types';

interface SportSearchInputProps {
  selectedSport: Sport | null;
  onSportSelect: (sport: Sport | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SportSearchInput: React.FC<SportSearchInputProps> = ({
  selectedSport,
  onSportSelect,
  placeholder = "Search sports...",
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const { sports, isLoading, hasResults } = useSportSearch(searchQuery, isOpen);

  return (
    <GenericSearchInput
      selectedItem={selectedSport as Sport & { [key: string]: unknown } | null}
      onItemSelect={(item) => onSportSelect(item as Sport | null)}
      placeholder={placeholder}
      disabled={disabled}
      searchItems={sports as (Sport & { [key: string]: unknown })[]}
      isLoading={isLoading}
      hasResults={hasResults}
      displayField="name"
      subDisplayField="status"
      icon={<Trophy className="h-4 w-4 text-gray-400" />}
      minSearchLength={3}
      onSearchChange={setSearchQuery}
      onOpenChange={setIsOpen}
    />
  );
};

export default SportSearchInput;
