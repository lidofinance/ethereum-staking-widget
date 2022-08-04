## [1.16.2](https://github.com/lidofinance/staking-widget-ts/compare/1.16.1...1.16.2) (2022-08-03)

### Bug Fixes

- ambire wallet autoconnect issue ([adef3d0](https://github.com/lidofinance/staking-widget-ts/commit/adef3d09353c346000b1c877a48a37a37e4bfb3d))
- lido-sdk/web3-react 1.23, lido-ui-blocks 2.5.2 ([c071de8](https://github.com/lidofinance/staking-widget-ts/commit/c071de8a4e8410a6a193f3c93674ffe61629f1c1))
- lido-ui-blocks 2.5.3 (ambire fix) ([533bf76](https://github.com/lidofinance/staking-widget-ts/commit/533bf76d989d8bb8f5daed2150d9e920ce8a765f))

## [1.16.1](https://github.com/lidofinance/staking-widget-ts/compare/1.16.0...1.16.1) (2022-07-25)

### Bug Fixes

- revert of revert 1inch mobile deeplink ([65c7f2b](https://github.com/lidofinance/staking-widget-ts/commit/65c7f2b04087350df550de7a44b265dd6b5f3333))

# [1.16.0](https://github.com/lidofinance/staking-widget-ts/compare/1.15.1...1.16.0) (2022-07-18)

### Bug Fixes

- brave wallet fixes ([a29489c](https://github.com/lidofinance/staking-widget-ts/commit/a29489c7aad67d12c0547064d3c9f89f0a1f03de))
- improve checks for imtoken and trust wallet connect() ([6a87bca](https://github.com/lidofinance/staking-widget-ts/commit/6a87bca62cc22d69407c88005cc01451656fb264))
- revert 1inch mobile deeplink ([59f8ef1](https://github.com/lidofinance/staking-widget-ts/commit/59f8ef1731b192d30e217be2e080262e4b19dc8f))
- use correct provider name for brave wallet ([ffad6f2](https://github.com/lidofinance/staking-widget-ts/commit/ffad6f24d6aff3d2a3b8e7ce1563acd435ccc1c7))
- use replace instead of replaceall ([59bc95e](https://github.com/lidofinance/staking-widget-ts/commit/59bc95e3aa6734b92fdb98030cefb5a12c1364cb))

### Features

- add brave wallet ([3aa2112](https://github.com/lidofinance/staking-widget-ts/commit/3aa211276764bd6984d8db4682ba2672efed075a))
- open 1inch in ledger live mobile ([4bc71f5](https://github.com/lidofinance/staking-widget-ts/commit/4bc71f5325fd82bd70c020c9707811dc20ec9481))

## [1.15.1](https://github.com/lidofinance/staking-widget-ts/compare/1.15.0...1.15.1) (2022-07-11)

### Bug Fixes

- disable blockchain.com and zengo wallets ([05ab6f2](https://github.com/lidofinance/staking-widget-ts/commit/05ab6f2fa01501293b9865fdc5902e5ed560ebfd))

# [1.15.0](https://github.com/lidofinance/staking-widget-ts/compare/1.14.4...1.15.0) (2022-07-08)

### Bug Fixes

- change scorecard link ([924db9f](https://github.com/lidofinance/staking-widget-ts/commit/924db9f253653fa2d77d68b3de4c11c83877a2ab))
- end metric before clearing timeout for more precise request timing ([4f0b0a3](https://github.com/lidofinance/staking-widget-ts/commit/4f0b0a363fb9e47600054428b9faa05edd6f07a6))
- fix lint issues ([b97e611](https://github.com/lidofinance/staking-widget-ts/commit/b97e6116af556103a0b0c52b73a58e18ee9f49e3))
- fix types ([d9e5b70](https://github.com/lidofinance/staking-widget-ts/commit/d9e5b70c898ff12f9af6e9b778d4a76a8baaa092))
- handle partial stats received ([73894b8](https://github.com/lidofinance/staking-widget-ts/commit/73894b846482a2b4e8238a7f3fbb7c4ef24affab))
- **metrics:** resolve react type issues ([e9ca6a3](https://github.com/lidofinance/staking-widget-ts/commit/e9ca6a3475f5ff29926f07615aabed8731b73bce))
- reinstantiate abortcontroller on each request ([4484780](https://github.com/lidofinance/staking-widget-ts/commit/4484780b03dfe59590c13b87ef8466fcf11a7d18))
- rename cache key ([412e631](https://github.com/lidofinance/staking-widget-ts/commit/412e631054c5b2a2fcec19c3e1d03c8b3503b1e7))
- update lido-sdk, lido-ui-blocks to fix metamask name ([d647247](https://github.com/lidofinance/staking-widget-ts/commit/d647247389990ba9c4981985cefa9571e2ff0689))

### Features

- add Blockchain.com and ZenGo wallets, update lido packages ([654e63a](https://github.com/lidofinance/staking-widget-ts/commit/654e63a77d5e9fe93b698f373af6d7ae9b83c383))
- cache and timeout subgraph requests ([8d16e8d](https://github.com/lidofinance/staking-widget-ts/commit/8d16e8d7a47a9681ab02da8944e86b6189216d5c))
- log func name ([cae10a7](https://github.com/lidofinance/staking-widget-ts/commit/cae10a7f7a64331fe24e8a4df6cdb12a08b53d00))
- log subgraph fail ([b7bfd9d](https://github.com/lidofinance/staking-widget-ts/commit/b7bfd9d10d4fec2d17770f28b0fc0f17adc6ca82))
- specify subgraph request timeout using env var ([2543489](https://github.com/lidofinance/staking-widget-ts/commit/2543489888edac3aeff4e8452c1eab4e8b4177fa))
- update lido-sdk/contracts to 2.0.0 ([549bf57](https://github.com/lidofinance/staking-widget-ts/commit/549bf57a4e45c1015afdc14e52bdf75d69c90af8))
- use ms for TTL readability ([ff8de4e](https://github.com/lidofinance/staking-widget-ts/commit/ff8de4e59cea7780b45d81fbe4a1dae3c225cec1))
- use node16 for native abort controller ([3c50e7a](https://github.com/lidofinance/staking-widget-ts/commit/3c50e7ae6f425c6631f41ee38ccf17ad2103ad47))

## [1.14.4](https://github.com/lidofinance/staking-widget-ts/compare/1.14.3...1.14.4) (2022-06-27)

### Bug Fixes

- **api:** save memory streaming response from external rpc ([80cd143](https://github.com/lidofinance/staking-widget-ts/commit/80cd143f21691a1a86aab5bfff406769a5873e7d))
- fix link visited color ([eda6886](https://github.com/lidofinance/staking-widget-ts/commit/eda6886b63bb44eda49f3e8feccdf476014eab40))
- open 1inch link in new tab ([235fabc](https://github.com/lidofinance/staking-widget-ts/commit/235fabcb86f7f709ced1a88c441639a4408dae55))
- remove deeplink from visible text ([be66f32](https://github.com/lidofinance/staking-widget-ts/commit/be66f32b88896339ad72a6f51059cad5a7fd732a))
- revert wrong release commit ([7099cdc](https://github.com/lidofinance/staking-widget-ts/commit/7099cdc0cb9e80825db2f9496bcad8573c034f9d))
- use 1inch url for mobile for now ([752025b](https://github.com/lidofinance/staking-widget-ts/commit/752025beb9c406c465f3f13efc5e4d70ea01434a))

### Features

- hide Ambire wallet due to issues with it ([dba9418](https://github.com/lidofinance/staking-widget-ts/commit/dba941853bcd937f8cf4a826b1fd761eb7778fea))
- unhide Ambire wallet ([0bf6569](https://github.com/lidofinance/staking-widget-ts/commit/0bf6569b6fa09c86160e7e47299271ad2d29eee3))
- use 1inch deeplink for Ledger Live ([b61c0f8](https://github.com/lidofinance/staking-widget-ts/commit/b61c0f8b0fb4d83cc26d5ff30549c6eb18f7c88e))

## [1.14.3](https://github.com/lidofinance/staking-widget-ts/compare/1.14.2...1.14.3) (2022-06-22)

### Bug Fixes

- **api:** back to server side props to get right env ([44a35b7](https://github.com/lidofinance/staking-widget-ts/commit/44a35b739f9342df97345168d6cd1233ac4c341f))

## [1.14.2](https://github.com/lidofinance/staking-widget-ts/compare/1.14.1...1.14.2) (2022-06-19)

### Bug Fixes

- resolve page load CPU over-consumption ([cc48c5d](https://github.com/lidofinance/staking-widget-ts/commit/cc48c5d0846c28ae21128e13d07a3661c9330070))

## [1.14.1](https://github.com/lidofinance/staking-widget-ts/compare/1.14.0...1.14.1) (2022-06-17)

### Bug Fixes

- **api:** save memory streaming response from external rpc ([3abab2c](https://github.com/lidofinance/staking-widget-ts/commit/3abab2ce461db74968749354b32560de39982f55))

# [1.14.0](https://github.com/lidofinance/staking-widget-ts/compare/1.13.0...1.14.0) (2022-06-16)

### Bug Fixes

- set curl=7.83.1-r1 at Dockerfile ([725155b](https://github.com/lidofinance/staking-widget-ts/commit/725155b7acdf58b3399db33846a37bf203607d13))
- set git=2.36.1-r0 at Dockerfile ([5634795](https://github.com/lidofinance/staking-widget-ts/commit/56347957928e7de63d3c8f80b2c19de3e280dcd4))

### Features

- revert lido-ui-blocks to v1 ([f0a5076](https://github.com/lidofinance/staking-widget-ts/commit/f0a507693761be9b987463f53353bdba6a405cf9))
- update lido-ui-blocks to v2.0.2 (revert of revert) ([45b8354](https://github.com/lidofinance/staking-widget-ts/commit/45b8354e0e27b9e1798b585014ab5508faa5ef9b))
