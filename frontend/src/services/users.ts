import api from './api';
import { UserUpdate } from '@/types/users';

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data.data;
};

export const updateCurrentUser = async (userData: UserUpdate) => {
  const response = await api.put('/users/me', userData);
  return response.data.data;
};
