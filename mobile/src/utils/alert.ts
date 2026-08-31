// Cross-platform alert/confirm helper.
//
// React Native's `Alert.alert` is a no-op on web, so any confirmation/error
// surfaced through it silently disappears in the browser. This helper detects
// the platform and routes to the native Alert or the browser confirm/alert UI.

import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS === 'web') {
    const confirmBtn = buttons?.find((b) => b.text !== 'Cancel' || buttons.length === 1);
    if (buttons && buttons.some((b) => b.text === 'Cancel') && buttons.some((b) => b.text !== 'Cancel')) {
      // Treat as a confirmation dialog: Cancel = no, the other = yes.
      const ok = window.confirm(message ? `${title}\n\n${message}` : title);
      if (ok) {
        const yes = buttons.find((b) => b.text !== 'Cancel');
        yes?.onPress?.();
      } else {
        const no = buttons.find((b) => b.text === 'Cancel');
        no?.onPress?.();
      }
    } else {
      window.alert(message ? `${title}\n\n${message}` : title);
      confirmBtn?.onPress?.();
    }
    return;
  }

  Alert.alert(
    title,
    message,
    buttons?.map((b) => ({ text: b.text ?? 'OK', onPress: b.onPress, style: b.style })) as any,
  );
}
