import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
const { enableQaHelpers } = publicRuntimeConfig;

export { enableQaHelpers };
