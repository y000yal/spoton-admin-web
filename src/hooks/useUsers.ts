import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserQueryParams } from '../services/api/users';
import type { CreateUserRequest, UpdateUserRequest, PaginatedResponse, User } from '../types';

// Query keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: UserQueryParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
};

// Hooks for users list
export const useUsers = (params: UserQueryParams) => {
  return useQuery<PaginatedResponse<User>>({
    queryKey: usersKeys.list(params),
    queryFn: () => userService.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single user
export const useUser = (userId: number) => {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });
};

// Mutation for creating user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

// Mutation for updating user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: number; userData: UpdateUserRequest }) => 
      userService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(usersKeys.detail(variables.userId), data);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

// Mutation for deleting user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};
