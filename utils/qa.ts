import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const enableQaHelpers = publicRuntimeConfig.enableQaHelpers === 'true';
