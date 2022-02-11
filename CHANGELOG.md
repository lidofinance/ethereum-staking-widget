# [1.7.0](https://github.com/lidofinance/staking-widget-ts/compare/1.6.1...1.7.0) (2022-02-11)


### Bug Fixes

* lido-ui update to fix default system theme ([97034ae](https://github.com/lidofinance/staking-widget-ts/commit/97034aedcf738b3e5489ef31609390d98ac07c91))
* pass shouldInvertWalletIcon to WalletsModalForEth ([d693c04](https://github.com/lidofinance/staking-widget-ts/commit/d693c04d0bdc7fd8eaf347c4e82bb40c612b4158))


### Features

* **metrics:** split supported chains into separate values ([28c605c](https://github.com/lidofinance/staking-widget-ts/commit/28c605ceabb7c4b36f175ec64462c1c21eba5c78))
* auto colour theme logic ([e1cbbef](https://github.com/lidofinance/staking-widget-ts/commit/e1cbbef89b274c7e4c9f5108dd2d1383e68eac24))
* integrate connect-wallet-modal UI block ([306de64](https://github.com/lidofinance/staking-widget-ts/commit/306de64b5ca1030f8444e8d82069795f214dc82e))
* **metrics:** include chain label with request metric ([325f9b8](https://github.com/lidofinance/staking-widget-ts/commit/325f9b8d120588f0e82a194929b0a09eb3d8064d))



## [1.6.1](https://github.com/lidofinance/staking-widget-ts/compare/1.6.0...1.6.1) (2022-01-17)


### Bug Fixes

* allow iframe embedding ([6cf6461](https://github.com/lidofinance/staking-widget-ts/commit/6cf64617e49bb5045cb4d735df2c7877f6e41c2d))



# [1.6.0](https://github.com/lidofinance/staking-widget-ts/compare/1.5.1...1.6.0) (2022-01-14)


### Bug Fixes

* **logging:** fix CSP log ([4be711d](https://github.com/lidofinance/staking-widget-ts/commit/4be711df2b61986d7d1b2c9dc66fecf3ba8f2f1e))
* **logging:** fix csp violation logs ([7499cb1](https://github.com/lidofinance/staking-widget-ts/commit/7499cb10e1eb0d510ebd8c5a5b292c1819f4d748))
* add csp defaults ([d1b7172](https://github.com/lidofinance/staking-widget-ts/commit/d1b71728e3d51b91a8e257990d73e85e70c0df27))
* ignore post-install typechain fail ([49c9712](https://github.com/lidofinance/staking-widget-ts/commit/49c971279d3743026411ec441c3944e6f9051e3b))
* **monitoring:** add walletconnect to csp ([4e262e0](https://github.com/lidofinance/staking-widget-ts/commit/4e262e0cb5723006c3d35c10f26a6dd273745ca7))


### Features

* **logging:** cover backend requests with logs ([7d85e10](https://github.com/lidofinance/staking-widget-ts/commit/7d85e10dd5007c1af189d606e4e85935e8b37516))
* **monitoring:** add csp app wrapper ([655a0ee](https://github.com/lidofinance/staking-widget-ts/commit/655a0ee079d55431d3e395964a338866ecd2dfb9))
* **monitoring:** add csp config ([a75d0b8](https://github.com/lidofinance/staking-widget-ts/commit/a75d0b8db02284ad35074984a47f1c1dbb5a2915))



## [1.5.1](https://github.com/lidofinance/staking-widget-ts/compare/1.5.0...1.5.1) (2021-12-21)


### Bug Fixes

* add close button to tx modal for ledger when fail/success ([68fa84e](https://github.com/lidofinance/staking-widget-ts/commit/68fa84e041652898494c89aed650346894ca8461))



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



