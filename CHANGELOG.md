# [1.5.0](https://github.com/lidofinance/staking-widget-ts/compare/1.4.0...1.5.0) (2021-12-20)


### Bug Fixes

* buildInfo metric ([f49a92d](https://github.com/lidofinance/staking-widget-ts/commit/f49a92d9df37a4e43795ca83815521cc16919427))
* export getStEthPrice ([b0ea668](https://github.com/lidofinance/staking-widget-ts/commit/b0ea6680d722f42cdfa44037a460fbd39d2fb784))
* getEthPrice ([8b09dcc](https://github.com/lidofinance/staking-widget-ts/commit/8b09dcc11064406908461e523d1e558d475c7044))
* getTotalStaked ([4167adb](https://github.com/lidofinance/staking-widget-ts/commit/4167adb5b88b12b025974456d195779eb9080dd9))
* metrics ([abc0510](https://github.com/lidofinance/staking-widget-ts/commit/abc05109c0e66268fcf745cb4dda84fe574e3d2b))
* rpcResponseTime another way to set label ([7176b79](https://github.com/lidofinance/staking-widget-ts/commit/7176b794d7909cb6c07fe37c35b3d4de43c590da))
* **metrics:** call clear for HMR support ([431368f](https://github.com/lidofinance/staking-widget-ts/commit/431368f2bd5bd48efbd2517afc9b4072bce2960d))
* small fixes and comments ([062c0e4](https://github.com/lidofinance/staking-widget-ts/commit/062c0e4033aca8ffde48052d45cdfd355fa57c07))


### Features

* api method /api/lido-stats ([41378c5](https://github.com/lidofinance/staking-widget-ts/commit/41378c58a85067e343f1f2c34b4cd9b2ed348fc5))
* Chainlink STETH/USD Price Feed aggregator ([0c46e27](https://github.com/lidofinance/staking-widget-ts/commit/0c46e27ee7813de840b161948746f2add5511b0f))
* delete console.log (paranoia about secrets) ([0568ed4](https://github.com/lidofinance/staking-widget-ts/commit/0568ed49679d7322e3256ccc41098ca6204549f1))
* get lido holders via subgraphs ([8b52e0c](https://github.com/lidofinance/staking-widget-ts/commit/8b52e0c7944bd9a940c4a3db501c28a9a20f3ed2))
* get stEth price ([57eb383](https://github.com/lidofinance/staking-widget-ts/commit/57eb383a68b1de70040601f03d06062ff7f7ffa6))
* metric (response time) for subgraphs ([0a25fcf](https://github.com/lidofinance/staking-widget-ts/commit/0a25fcf448792e34f681eea7887b11834ff9fa86))
* metrics for each rpc call ([03c403c](https://github.com/lidofinance/staking-widget-ts/commit/03c403ce630a5b2ab820b74118aad72b5932da2b))
* move serverLogger to utilsApi directory ([7875052](https://github.com/lidofinance/staking-widget-ts/commit/7875052bb726c2041b3e7a327e3dfb59140e57d9))
* move some server side utils to utilsApi directory ([e62891b](https://github.com/lidofinance/staking-widget-ts/commit/e62891b6b794f20ad6cb042cae5950cf42b31137))
* remove close button on tx modal for ledger ([c318cf9](https://github.com/lidofinance/staking-widget-ts/commit/c318cf91a0883ee4b2f4e08fefbe02b042f4385d))
* return leader ([5e6da6c](https://github.com/lidofinance/staking-widget-ts/commit/5e6da6cec141c6c9ada165f23c09754a31fb28ec))
* update getStEthPrice ([5b8d3fd](https://github.com/lidofinance/staking-widget-ts/commit/5b8d3fd127f029d9cf8853cca421530932ece06d))
* useLidoStats is using the /api/lido-stats ([dc4b989](https://github.com/lidofinance/staking-widget-ts/commit/dc4b98921b66e913050278241fbf892f9b7850db))
* utilsApi directory for all server side utils ([d10e499](https://github.com/lidofinance/staking-widget-ts/commit/d10e4992863ef06001666465006a047463edea5d))


### Reverts

* **prom-client:** register.clear() ([c4ab647](https://github.com/lidofinance/staking-widget-ts/commit/c4ab647711a245fdf9429d682842feff606ab95d))



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



