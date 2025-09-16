import React from 'react';
import { User as UserIcon } from 'lucide-react';
import GenericSearchInput from './GenericSearchInput';
import { useUserSearch } from '../hooks/useUserSearch';
import type { User } from '../types';

interface UserSearchInputProps {
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({
  selectedUser,
  onUserSelect,
  placeholder = "Search users...",
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const { users, isLoading, hasResults } = useUserSearch(searchQuery, isOpen);

  return (
    <GenericSearchInput
      selectedItem={selectedUser as User & { [key: string]: unknown } | null}
      onItemSelect={(item) => onUserSelect(item as User | null)}
      placeholder={placeholder}
      disabled={disabled}
      searchItems={users as (User & { [key: string]: unknown })[]}
      isLoading={isLoading}
      hasResults={hasResults}
      displayField="full_name"
      subDisplayField="email"
      icon={<UserIcon className="h-4 w-4 text-gray-400" />}
      minSearchLength={3}
      onSearchChange={setSearchQuery}
      onOpenChange={setIsOpen}
    />
  );
};

export default UserSearchInput;
