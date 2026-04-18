import { useCurrentUser } from '@Features/user/user.queries';

const VISITED_KEY = 'hasVisited';

export const useWelcomeSession = () => {
  const { data: user, isLoading } = useCurrentUser();

  const isFirstVisit = !localStorage.getItem(VISITED_KEY);
  const isAuthenticated = !!user;

  const markVisited = () => localStorage.setItem(VISITED_KEY, 'true');

  return {
    isFirstVisit,
    isAuthenticated,
    isLoading,
    username: user?.username ?? null,
    markVisited,
  };
};