import { User } from '../types';

const USER_KEY = 'streamify_user';

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Basic validation
  if (!email.includes('@')) {
    throw new Error("Please enter a valid email address.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  // Mock user creation
  const user: User = {
    id: 'u-' + Date.now(),
    name: email.split('@')[0], // Use part before @ as name
    email: email,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!email.includes('@')) throw new Error("Invalid email address.");
  if (password.length < 6) throw new Error("Password is too short (min 6 chars).");
  if (!name) throw new Error("Name is required.");

  const user: User = {
    id: 'u-' + Date.now(),
    name: name,
    email: email,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  try {
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};
