import buildInfo from 'build-info.json';

export const APP_NAME = 'lido-staking-widget';
export const APP_VERSION = buildInfo.version;

// How the app identifies itself to RPC providers and other upstreams.
// Importers outside `config/` must take this from 'config/groups/app' rather
// than the `config` barrel: the barrel reaches standardFetcher through
// provider -> external-config, so a barrel import there would be cyclic.
export const USER_AGENT = `${APP_NAME}/${APP_VERSION}`;
