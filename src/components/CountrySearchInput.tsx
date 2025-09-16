import React from 'react';
import { MapPin } from 'lucide-react';
import GenericSearchInput from './GenericSearchInput';
import { useCountrySearch } from '../hooks/useCountrySearch';
import type { Country } from '../types';

interface CountrySearchInputProps {
  selectedCountry: Country | null;
  onCountrySelect: (country: Country | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CountrySearchInput: React.FC<CountrySearchInputProps> = ({
  selectedCountry,
  onCountrySelect,
  placeholder = "Search countries...",
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const { countries, isLoading, hasResults } = useCountrySearch(searchQuery, isOpen);

  return (
    <GenericSearchInput
      selectedItem={selectedCountry as Country & { [key: string]: unknown } | null}
      onItemSelect={(item) => onCountrySelect(item as Country | null)}
      placeholder={placeholder}
      disabled={disabled}
      searchItems={countries as (Country & { [key: string]: unknown })[]}
      isLoading={isLoading}
      hasResults={hasResults}
      displayField="name"
      icon={<MapPin className="h-4 w-4 text-gray-400" />}
      minSearchLength={2}
      onSearchChange={setSearchQuery}
      onOpenChange={setIsOpen}
    />
  );
};

export default CountrySearchInput;
