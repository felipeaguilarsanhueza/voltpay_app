import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'activeSession';
export const saveSession = async session => {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
};
export const loadSession = async () => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearSession = async () => {
  await AsyncStorage.removeItem(KEY);
};