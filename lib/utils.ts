import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractKeys = (data: any[]) => {
  const keysSet = new Set();
  data.forEach((student) => {
    Object.keys(student).forEach((key) => {
      if (key !== '_id') {
        keysSet.add(key);
      }
    });
  });
  return Array.from(keysSet);
};

export function sortUsersById(users: any[]) {
  return users.slice().sort((a, b) => {
    return a.id - b.id;
  });
}
