/// <reference types="vite-plugin-pwa/client" /> 
import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('New content available — please refresh.');
      },
      onOfflineReady() {
        console.log('App is ready to work offline.');
      }
    });
    return updateSW;
  } catch (e) {
    // virtual import won't exist in non-bundled contexts; swallow errors during SSR/editor visits // eslint-disable-next-line no-console
    console.warn('Service worker registration skipped:', e);
    return () => {};
  }
}
