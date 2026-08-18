import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * The web build is statically rendered, so the HTML is produced with no idea
 * what the visitor's colour scheme is. Reading it during the first client
 * render would disagree with that HTML and React would throw out the markup.
 *
 * `useSyncExternalStore` is the sanctioned way to say "this differs between
 * server and client": it returns the server snapshot for the hydrating render
 * and the client snapshot from then on, without a setState-in-effect that
 * would cost an extra render pass.
 */
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function useColorScheme() {
  const hydrated = useSyncExternalStore(subscribe, onClient, onServer);
  const colorScheme = useRNColorScheme();

  return hydrated ? colorScheme : 'light';
}
