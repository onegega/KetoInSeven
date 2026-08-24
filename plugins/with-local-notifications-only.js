const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Drops the `aps-environment` entitlement that `expo-notifications` adds by default.
 *
 * That entitlement is what lets an app register with Apple's push service and
 * receive notifications sent from a server. KetoInSeven never does that: the
 * weekly reminder is scheduled on the device itself (see `src/lib/notifications.ts`),
 * and a locally scheduled notification needs no entitlement at all. So the
 * generated project was asking Apple for a capability the app does not use.
 *
 * That is not merely untidy. Apple does not grant push to free "personal" teams,
 * so the unused entitlement makes provisioning fail outright — anyone building
 * with a plain Apple ID cannot install the app on their own phone. Removing it
 * costs nothing and unblocks them.
 *
 * We delete the key rather than trying to stop it being written, because the
 * `expo-notifications` mod guards on `if (!config.modResults['aps-environment'])`
 * and the entitlement has no falsy value meaning "off" — Apple accepts only
 * "development" or "production" — so there is nothing we could set ahead of it
 * to opt out.
 *
 * Deleting therefore requires running *after* that mod, which is why this plugin
 * is listed *before* `expo-notifications` in app.json. Mods compose inside out:
 * each one runs its own work and then calls the mod registered before it, so the
 * plugin listed last runs first and the plugin listed first runs last. The array
 * order reads backwards from the execution order, so leave these two where they
 * are — swapping them silently restores the entitlement.
 */
module.exports = function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
