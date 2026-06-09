/** Full-page navigation (outside React Router). */
export function navigateTo(url: string) {
  globalThis.location.assign(url);
}
