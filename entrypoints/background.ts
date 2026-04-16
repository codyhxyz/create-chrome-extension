import { onMessage } from '@/utils/messaging';

export default defineBackground(() => {
  // --- Installation ---
  browser.runtime.onInstalled.addListener((details) => {
    console.log(`Extension installed: ${details.reason}`);
  });

  // --- Messaging (remove if unused) ---
  onMessage('ping', () => {
    return 'pong';
  });

  // --- Alarms (remove if unused) ---
  browser.alarms.create('periodic-check', { periodInMinutes: 30 });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'periodic-check') {
      console.log('Periodic alarm fired');
    }
  });
});
