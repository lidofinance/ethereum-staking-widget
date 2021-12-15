# [1.4.0](https://github.com/lidofinance/staking-widget-ts/compare/1.3.0...1.4.0) (2021-12-15)


### Bug Fixes

* rename function in getEthApr ([67da263](https://github.com/lidofinance/staking-widget-ts/commit/67da263fd51b12aca6206885a5c33fe84b5fa777))
* rpc fallback for /api/rpc ang logging ([2a3c590](https://github.com/lidofinance/staking-widget-ts/commit/2a3c59099c016282292d8661f62a0ba6769fabff))


### Features

* add ledger transaction icons ([785b983](https://github.com/lidofinance/staking-widget-ts/commit/785b983f7618f40583822084eb64b2fafda4650a))
* **metrics:** base and response time of infura/alchemy ([cd36af9](https://github.com/lidofinance/staking-widget-ts/commit/cd36af922179486b76394b21e39c8b211813fd26))
* add favicon ([9c2e268](https://github.com/lidofinance/staking-widget-ts/commit/9c2e2688d3bdd0ee130618b539f4ace34341bfdf))
* build-info.json for DevOps ([b61ad2b](https://github.com/lidofinance/staking-widget-ts/commit/b61ad2b17c138147dfadbb84a3b17309f2d204f4))
* return ledger wallet ([a9b03b8](https://github.com/lidofinance/staking-widget-ts/commit/a9b03b8f8795abd14de96fc024d1941bf377470f))


### Reverts

* ledger wallet ([ea52c5a](https://github.com/lidofinance/staking-widget-ts/commit/ea52c5ad41bbbda74e663092d22cadb00318f5d9))



# [1.3.0](https://github.com/lidofinance/staking-widget-ts/compare/1.2.0...1.3.0) (2021-12-10)


### Bug Fixes

* comments and no-useless-catch ([a2f8944](https://github.com/lidofinance/staking-widget-ts/commit/a2f89445a6a632825325b25862eacb5e9190024a))


### Features

* api/eth-price with fallbacks ([62bce8d](https://github.com/lidofinance/staking-widget-ts/commit/62bce8d1dacfff6c7cae88bdb052d7ea8afc95ff))
* api/steth-apr with fallbacks ([4e968c0](https://github.com/lidofinance/staking-widget-ts/commit/4e968c0d8fe90a6c4e9314780ebd1ed277b1526e))
* api/totalsupply with fallbacks ([6b7eec7](https://github.com/lidofinance/staking-widget-ts/commit/6b7eec722842ecbb2e783f400e9a7c1eb9741280))


### Reverts

* comment logs with secrets ([3fddb00](https://github.com/lidofinance/staking-widget-ts/commit/3fddb00a5e95e513cf5c7f59238bd6b894a4a0ff))



# [1.2.0](https://github.com/lidofinance/staking-widget-ts/compare/1.1.0...1.2.0) (2021-12-08)


### Bug Fixes

* all modals have same height ([9a39fd8](https://github.com/lidofinance/staking-widget-ts/commit/9a39fd87960cf1cca3c8fce9e434c2a7b07f3c9f))
* host and chainId in meta ([8dfcdbc](https://github.com/lidofinance/staking-widget-ts/commit/8dfcdbcf7df5c15c36d3fcc49c91ac1e5987c887))
* slice text in `You will receive` block ([df4ba78](https://github.com/lidofinance/staking-widget-ts/commit/df4ba782ffb9dfd8d75bea18185acb02482d638c))
* slice You will receive after 31 symbol ([3e82182](https://github.com/lidofinance/staking-widget-ts/commit/3e82182662d658cbe89154d9277ae7e347f72d64))
* use DocumentInitialProps for MyDocument ([f6b4ff2](https://github.com/lidofinance/staking-widget-ts/commit/f6b4ff21c5f3a324d043bca347e737c655a3f1ee))


### Features

* delete referral page ([220afc2](https://github.com/lidofinance/staking-widget-ts/commit/220afc2a25b85be414ebe7163a1c919377b5181e))
* meta data and preview image ([d2c97ab](https://github.com/lidofinance/staking-widget-ts/commit/d2c97abdeec3786bc098bb20ccf074f16680a4ac))
* new history icon in header ([1504fea](https://github.com/lidofinance/staking-widget-ts/commit/1504fea68a284a96ea94bdcba2bb39a5ed10cfb2))
* rename history to rewards in header ([ad3ee35](https://github.com/lidofinance/staking-widget-ts/commit/ad3ee3561b47978f08016cad69ee853a2a36b054))


### Reverts

* disabled MathWallet ([1b16db2](https://github.com/lidofinance/staking-widget-ts/commit/1b16db2d9e93aec5835c50e1be5343885134be1f))



# [1.1.0](https://github.com/lidofinance/staking-widget-ts/compare/1.0.3...1.1.0) (2021-12-03)


### Bug Fixes

* **logging:** use console logging ([0188f6e](https://github.com/lidofinance/staking-widget-ts/commit/0188f6ec2ae31017b689e1eac6df8d3070929d7e))
* /api/rpc defaultChain from publicRuntimeConfig ([4d1e6eb](https://github.com/lidofinance/staking-widget-ts/commit/4d1e6ebf91693e518aeec4594c4c9e39e9968208))
* hover color of theme toggler button ([fda7410](https://github.com/lidofinance/staking-widget-ts/commit/fda7410df2cb8716cd3b57a6a5b5eb180b73b188))


### Features

* /api/apr cors for all ([228989a](https://github.com/lidofinance/staking-widget-ts/commit/228989aa573ae766ceb1848f38ce522482eb0256))
* /api/apr cors via middleware ([f27c303](https://github.com/lidofinance/staking-widget-ts/commit/f27c3030ca13d9535f6ba42ab63466936ba9eacc))
* add ledger support ([5e9ceba](https://github.com/lidofinance/staking-widget-ts/commit/5e9ceba8139986052c0e9fbe109c506e75ba4dde))
* **monitoring:** add default metrics endpoint ([06a00d5](https://github.com/lidofinance/staking-widget-ts/commit/06a00d5528164ea7dc123a881b1c9c676e75a029))
* **monitoring:** add health check endpoint ([b88b472](https://github.com/lidofinance/staking-widget-ts/commit/b88b472bee066fdadcfa356256063d4404408298))
* **monitoring:** log errors in JSON ([346f9ed](https://github.com/lidofinance/staking-widget-ts/commit/346f9ed567160fef577702a29cc7a0db082feb0b))
* updated Dockerfile (no root, use healtcheck and multistage build) ([2efb77d](https://github.com/lidofinance/staking-widget-ts/commit/2efb77df8b7265db212eb8efa2e1003a6b88056a))


### Reverts

* hide ledger ([5137f6a](https://github.com/lidofinance/staking-widget-ts/commit/5137f6a724cfab1cebf1dfccdb58f848f5169c4c))
* math wallet ([38c08c8](https://github.com/lidofinance/staking-widget-ts/commit/38c08c82e57ac7a10e88f42212143d1cb556dd0c))



