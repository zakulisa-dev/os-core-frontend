import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { userApi } from './user.api';

export const userKeys = {
  me: ['user', 'me'] as const,
};

export const useCurrentUser = () =>
  useQuery({
    queryKey: userKeys.me,
    queryFn: userApi.me,
    retry: false,
    staleTime: Infinity,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me });
      window.history.pushState(null, '', '/');
      window.location.reload();
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me });
      window.history.pushState(null, '', '/');
      window.location.reload();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.logout,
    onSettled: () => {
      queryClient.clear();
      localStorage.clear();
      document.location.reload();
    },
  });
};

export const useInitUser = () =>
  useQuery({
    queryKey: userKeys.me,
    queryFn: async () => {
      const user = await userApi.me();
      return user;
    },
    retry: false,
    staleTime: Infinity,
  });