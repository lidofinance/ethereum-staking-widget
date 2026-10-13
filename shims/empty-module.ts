/**
 * Stub for optional wallet-connector packages that are intentionally NOT
 * installed: `@base-org/account`, `porto`, `@gemini-wallet/core`,
 * `@react-native-async-storage/async-storage`.
 *
 * Parity with the old webpack config's `resolve.fallback: { '<pkg>': false }`
 * — consumers (wagmi/metamask-sdk connector discovery) require these inside
 * try/catch and degrade gracefully when the module resolves to a falsy
 * placeholder. If a consumer ever switches to static named imports, the
 * build will fail here — install the real package then.
 */
export default false as unknown;
