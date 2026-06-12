// Απτική ανάδραση (haptics) — ασφαλείς wrappers που δεν κάνουν τίποτα στο web
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export const tapLight = () => {
  if (supported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const tapMedium = () => {
  if (supported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

export const notifySuccess = () => {
  if (supported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export const notifyError = () => {
  if (supported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
