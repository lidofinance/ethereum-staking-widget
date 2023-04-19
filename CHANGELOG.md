## [1.60.1](https://github.com/lidofinance/staking-widget-ts/compare/1.60.0...1.60.1) (2023-04-19)


### Bug Fixes

* info box removed from claim page ([3f593a0](https://github.com/lidofinance/staking-widget-ts/commit/3f593a038cea8f48bc8caa06c73477f5cf260c9e))



# [1.60.0](https://github.com/lidofinance/staking-widget-ts/compare/1.59.1...1.60.0) (2023-04-18)


### Bug Fixes

* change 'participant' to 'participants' in request modal ([ae9befc](https://github.com/lidofinance/staking-widget-ts/commit/ae9befc2802c22ba3909010686bd095c23dbf903))
* clear code ([0acfde7](https://github.com/lidofinance/staking-widget-ts/commit/0acfde7e56f77f13d22ca20794d6d79b0879c5eb))
* clear withdrawal input after request ([e6624cf](https://github.com/lidofinance/staking-widget-ts/commit/e6624cf73c11a702fec8dff4adf1d2ad7021527d))
* createConnectors ([51966af](https://github.com/lidofinance/staking-widget-ts/commit/51966af60e423e043643eb1ea62640bad3a896de))
* enable next-logger and rename config to .cjs ([40bedcc](https://github.com/lidofinance/staking-widget-ts/commit/40bedccfb9e52e71db652772488d6075b88f658e))
* error when trying to enter very big number on withdrawal page ([9d315b0](https://github.com/lidofinance/staking-widget-ts/commit/9d315b0973d04f93dd6929927ea443530a185885))
* faq typo ([53b8543](https://github.com/lidofinance/staking-widget-ts/commit/53b8543f11c51049edf1e94a2fe081f22e917c8b))
* fix app error for small input value ([3f82e6a](https://github.com/lidofinance/staking-widget-ts/commit/3f82e6a6e4d083ea885d19dabe8625799c26ab40))
* fix calc requests, fix showing message ([77cfd74](https://github.com/lidofinance/staking-widget-ts/commit/77cfd74a8b81ba47f279bb5ce4022fa8ce8b93a4))
* fix request tx ([23e3cfb](https://github.com/lidofinance/staking-widget-ts/commit/23e3cfbf0a38165a069679ecafee2dda0960754a))
* maximum requests notif text ([dd41da5](https://github.com/lidofinance/staking-widget-ts/commit/dd41da5aff68f38a10b2fa6ab0b03f3ffee817ac))
* playwright in ESM mode ([602e473](https://github.com/lidofinance/staking-widget-ts/commit/602e4733f2737e6932b298560f63d5981ce37120))
* remove nft button from faq ([c7fd770](https://github.com/lidofinance/staking-widget-ts/commit/c7fd77007f4c298e953c3923d1c72d5558c299c5))
* remove one text ([fd9a20d](https://github.com/lidofinance/staking-widget-ts/commit/fd9a20d8c1e247b35a51b467f1a2b4a4c18262a9))
* remove prefilled value on unwrap page ([7d1f0e5](https://github.com/lidofinance/staking-widget-ts/commit/7d1f0e59616e15061ce65d0eaecfc3c1abaa9662))
* reset wrap amount on token change instead of max value, also no amount pre-fill on page load ([2c9f9ca](https://github.com/lidofinance/staking-widget-ts/commit/2c9f9caa3d7d0a3693e49dd7b8e48d5a693f80c4))
* show add nft button only for wallets that supports this action ([f9157af](https://github.com/lidofinance/staking-widget-ts/commit/f9157afc6022087e45830bc29b39ac99db8e4da6))
* temporary disable next-logger until fix ([89cc73c](https://github.com/lidofinance/staking-widget-ts/commit/89cc73c44a04cdf62c261d1209b08c387ffb7489))
* temporary use NoSSRWrapper to fix ReefKnot SSR issue ([6b1d3f4](https://github.com/lidofinance/staking-widget-ts/commit/6b1d3f43314dd5d692f24ed9b2a707f783c84446))
* use direct imports from reef-knot/web3-react ([01d2f5f](https://github.com/lidofinance/staking-widget-ts/commit/01d2f5fe4d589976b8db8686b1be0f4e28740689))
* use reef-knot 1.0.8 ([6d8c535](https://github.com/lidofinance/staking-widget-ts/commit/6d8c5355022da682a1308929914c15b813753e57))
* use reef-knot 1.0.9 ([724cf12](https://github.com/lidofinance/staking-widget-ts/commit/724cf12bb58d8c0ea65362099a190d61e9a18079))
* withdrawal request hook params cleanup ([07f056d](https://github.com/lidofinance/staking-widget-ts/commit/07f056d9975e180e11a61557f356b042f8139ae4))


### Features

* config next.js to use ESM, update packages ([d8ea9af](https://github.com/lidofinance/staking-widget-ts/commit/d8ea9af5a8122550e96582b0db63ca96d9037a79))
* config wagmi ([8655c75](https://github.com/lidofinance/staking-widget-ts/commit/8655c751b42514fe546847785add34cc951d51eb))
* get supportedChains for wagmi from env ([39aa581](https://github.com/lidofinance/staking-widget-ts/commit/39aa581141674e0f659958b8fc7aa1922679eacd))
* remove fiat amount from withdrawal option banner ([c2b9ed0](https://github.com/lidofinance/staking-widget-ts/commit/c2b9ed004328482adae22049823833d1a94f11cd))
* remove requests count from the tooltip, fix infinity requests when choosing wsteth ([2609f76](https://github.com/lidofinance/staking-widget-ts/commit/2609f760be1af599249eb267c1fb155243dbf07f))
* steth-wsteth/eth-steth exchange rates for request page ([5aa6d1f](https://github.com/lidofinance/staking-widget-ts/commit/5aa6d1fa758456e6c7257188ff6d6d22ce49dab0))
* update faq texts ([e61fd44](https://github.com/lidofinance/staking-widget-ts/commit/e61fd440135c3baae3275a301369acd256cc5ca0))
* use reef-knot 1.0.5 ([4fe7629](https://github.com/lidofinance/staking-widget-ts/commit/4fe7629cdc14a0d2ebe0667a954a42a1232fbe97))
* use reef-knot 1.0.6 ([16d0a57](https://github.com/lidofinance/staking-widget-ts/commit/16d0a573776076aba5f84d74af7ec223c96bc9d2))
* use reef-knot 1.0.7 ([eecd76f](https://github.com/lidofinance/staking-widget-ts/commit/eecd76f965d01da0f49eb086d02bdc329c199603))
* useDisconnect wagmi ([4447fd0](https://github.com/lidofinance/staking-widget-ts/commit/4447fd051a210520864b4718201f6621b1e65560))



## [1.59.1](https://github.com/lidofinance/staking-widget-ts/compare/1.59.0...1.59.1) (2023-04-13)


### Bug Fixes

* fix infinity gas price loader ([e34a55e](https://github.com/lidofinance/staking-widget-ts/commit/e34a55ed9d311757a24f3373e81e119e66da4d96))
* fix steth token label on wrap page ([28bf79e](https://github.com/lidofinance/staking-widget-ts/commit/28bf79ea7680457b4337011fdaa9f63b33fb9132))



# [1.59.0](https://github.com/lidofinance/staking-widget-ts/compare/1.58.0...1.59.0) (2023-04-12)


### Bug Fixes

* add temp error handler ([61d0a6d](https://github.com/lidofinance/staking-widget-ts/commit/61d0a6d62057fb522b1df6cb65f7e85d860cbebe))
* change handle server error status ([755d1bb](https://github.com/lidofinance/staking-widget-ts/commit/755d1bb606781dda97961154a195a1ea8b9d8b32))
* fix amount for stake ([dc72609](https://github.com/lidofinance/staking-widget-ts/commit/dc726092bbe55b943affb3f009c573a1084db36c))
* refactoring ([108a6a5](https://github.com/lidofinance/staking-widget-ts/commit/108a6a54ccfca1a178146b18e8147f6a81e74bec))
* remove hook ([d45aec0](https://github.com/lidofinance/staking-widget-ts/commit/d45aec061cb7475a5e306a0180a56a30ed035157))
* update l2 text banner ([c052427](https://github.com/lidofinance/staking-widget-ts/commit/c0524278995ddb9497e156219c59bb6e004f7c84))


### Features

* add bundle analyzer ([28d9967](https://github.com/lidofinance/staking-widget-ts/commit/28d996701b447e943ff1ab1e940e99dd400d9a7e))
* add random texts ([b3f4b44](https://github.com/lidofinance/staking-widget-ts/commit/b3f4b440a984ed7ea23f7a0a56b9f299e0701802))
* add removing amount from query ([18ebd13](https://github.com/lidofinance/staking-widget-ts/commit/18ebd13fd84f3e62a7c7abd724dd35b0fa23bae2))
* add server error ([b5ebdc8](https://github.com/lidofinance/staking-widget-ts/commit/b5ebdc8ad59beec0b667d1de5ae87e6321befecd))
* add set diff amount to query url ([ade2d8c](https://github.com/lidofinance/staking-widget-ts/commit/ade2d8c48d791a9429509c4b4ac011d3682550e0))
* add tvl message ([1bf5106](https://github.com/lidofinance/staking-widget-ts/commit/1bf51062d55e7a2fe6eb9baab14576aeac10badb))
* change error handler for rewards page ([13889bc](https://github.com/lidofinance/staking-widget-ts/commit/13889bca1e6172fc2bac44d9f5735432f64db009))
* more detailed subgraph errors ([57c328c](https://github.com/lidofinance/staking-widget-ts/commit/57c328ce62dc97c7d72823f51f42922675fd0b69))
* update text on l2 banner ([1deef8b](https://github.com/lidofinance/staking-widget-ts/commit/1deef8bbabaff09a3a656814dc3d2af4b1e0872e))



# [1.58.0](https://github.com/lidofinance/staking-widget-ts/compare/1.57.0...1.58.0) (2023-04-05)


### Bug Fixes

* change useSDK to useWeb3 for chainId ([4ff65c2](https://github.com/lidofinance/staking-widget-ts/commit/4ff65c2bbaaeff7d65cb9824715bd8b6ddc0bf31))
* delete inline style ([d6d04ed](https://github.com/lidofinance/staking-widget-ts/commit/d6d04ed8316878f30dc554a34120f392e8214ef3))
* fix bunker modal mobile style ([83e530c](https://github.com/lidofinance/staking-widget-ts/commit/83e530c8b3f7ef7677b6238b21ba8d50eb06354c))
* fix navigation links ([cb1877b](https://github.com/lidofinance/staking-widget-ts/commit/cb1877b12aa1b6957d15713c0c9274ca28c2c6c4))
* fix not connected wallet in header ([f102c4e](https://github.com/lidofinance/staking-widget-ts/commit/f102c4ecc0e362bd1e289d7e260158ab2c96a072))
* fix text ([32ff562](https://github.com/lidofinance/staking-widget-ts/commit/32ff562cfeecffb3bf2cdecbf6597659743c7a5b))
* fix text ([69d8e69](https://github.com/lidofinance/staking-widget-ts/commit/69d8e694aa479e8706e7b43e23f341bb0e19d346))
* fix text ([6dcf68a](https://github.com/lidofinance/staking-widget-ts/commit/6dcf68ae0e346d89f2cd9e1c29ddaf29971fe583))
* fix tooltip amount, fix input token name ([e357c00](https://github.com/lidofinance/staking-widget-ts/commit/e357c00d8e69cb3e88c9f2435c675b6befe3ee20))
* fixes after regression tests ([ff01e94](https://github.com/lidofinance/staking-widget-ts/commit/ff01e947bf5fa3ea426c57637ceae1eab7f500f7))
* hide eth amount symbol ([31dc34f](https://github.com/lidofinance/staking-widget-ts/commit/31dc34f8889d58a46604f4bdae74a2e5ec3d6821))
* refactoring wsteth calc hook ([6be5510](https://github.com/lidofinance/staking-widget-ts/commit/6be5510214c65761855e52459bd0b85bce38f437))
* remove zhejiang fallback ([c16239c](https://github.com/lidofinance/staking-widget-ts/commit/c16239c78235f58da3e9242f563db744650a8c1d))
* request prop type ([efebad9](https://github.com/lidofinance/staking-widget-ts/commit/efebad9b3c129f0c3628c1912224b9d2fe86da11))
* update text, request style ([55a5aeb](https://github.com/lidofinance/staking-widget-ts/commit/55a5aeb59a6e715c86f37077eb4401ab655d6195))
* withdrawals faq improvements ([3b904f0](https://github.com/lidofinance/staking-widget-ts/commit/3b904f0d474de338ba68325b799f9fd3f7ccf555))
* withdrawals faq text ([9ebc785](https://github.com/lidofinance/staking-widget-ts/commit/9ebc78548777d7492d10dd09712740a288b817c6))


### Features

* add calc fiat price, validate max input number, info message for requests count ([906619e](https://github.com/lidofinance/staking-widget-ts/commit/906619e1a6bfe4f322f04e54a83ab652e6bf203a))
* add calc wsteth ([5e5873a](https://github.com/lidofinance/staking-widget-ts/commit/5e5873af808033646d333e309f685ee0c29fd348))
* add links to FAQ ([9a1700f](https://github.com/lidofinance/staking-widget-ts/commit/9a1700fe5cbc18431503d3915085adce3d37b597))
* add show error if wallet connected ([3c50b74](https://github.com/lidofinance/staking-widget-ts/commit/3c50b74f8d51c957edefd2f17cdd42ea0f144d47))
* change nft banner ([b1b4c0b](https://github.com/lidofinance/staking-widget-ts/commit/b1b4c0be49f8a520b0ea0d2fad5cc2dcc3977149))
* change request tab info text ([4fbb2d8](https://github.com/lidofinance/staking-widget-ts/commit/4fbb2d8543c099085b81eff470251d190eb54fc1))
* claim faq ([21a0991](https://github.com/lidofinance/staking-widget-ts/commit/21a099156cd5e7206b83f8d4699bf92054d338f6))
* hide requests list on request tab ([da6dda8](https://github.com/lidofinance/staking-widget-ts/commit/da6dda8d7fb321e00ac3ac2483cae2dd5fbe1eaf))
* show calc data for any input value ([d20e53d](https://github.com/lidofinance/staking-widget-ts/commit/d20e53d9583627e371ad77f582948e8c4477c646))
* update bunker mode text ([2d0c50e](https://github.com/lidofinance/staking-widget-ts/commit/2d0c50e61321ee009c20c1493b25a6c43427696e))
* update queu tooltip style ([4a52fc3](https://github.com/lidofinance/staking-widget-ts/commit/4a52fc3a744ebf4b67300b8f357be50839262e31))
* update text, change nft banner ([7ba5e9e](https://github.com/lidofinance/staking-widget-ts/commit/7ba5e9e9dc2210482aeab164a260afce31984437))
* withdrawals faq ([6b70369](https://github.com/lidofinance/staking-widget-ts/commit/6b703690ba53ca495f96df7ded40971a236759d6))
* withdrawals faq links and dynamic data ([5acc97e](https://github.com/lidofinance/staking-widget-ts/commit/5acc97e928c7b1aebb4dd17cbd71a6b133857df9))
* withdrawals faq texts update ([a5128e5](https://github.com/lidofinance/staking-widget-ts/commit/a5128e5dee56d50e04aeadae27a449f95ff5c1bc))



# [1.57.0](https://github.com/lidofinance/staking-widget-ts/compare/1.56.0...1.57.0) (2023-03-14)


### Bug Fixes

* date order ([b95ad3f](https://github.com/lidofinance/staking-widget-ts/commit/b95ad3fb7c027209b593d9059ca8e38955adeef0))
* date visibility ([45b9d4d](https://github.com/lidofinance/staking-widget-ts/commit/45b9d4dd028ac71658307be28953d4bbd5cbae67))
* header border ([5e3b9eb](https://github.com/lidofinance/staking-widget-ts/commit/5e3b9eb2e3e0c8c30cce4841925d81624ee195f6))


### Features

* mobile reward list header ([ad94fa0](https://github.com/lidofinance/staking-widget-ts/commit/ad94fa0be85435763a539a30ef03dd3ea46cf1f9))
* mobile rewards table ([c69fc21](https://github.com/lidofinance/staking-widget-ts/commit/c69fc21a8d4d3f820c81329927fa60843be09822))



# [1.56.0](https://github.com/lidofinance/staking-widget-ts/compare/1.55.0...1.56.0) (2023-03-13)


### Bug Fixes

* add etherscan link for unwrap ([84db2ec](https://github.com/lidofinance/staking-widget-ts/commit/84db2eca5fdbf426e3467f1f76be8d0dae6c7eb1))
* unwrap disable on error ([9adf620](https://github.com/lidofinance/staking-widget-ts/commit/9adf6200c59a53c49fbf6106576fe0337b99bfb8))


### Features

* disable buttons on validation error ([929c405](https://github.com/lidofinance/staking-widget-ts/commit/929c4053f15f91d046b326e17c3d71b1a637f34e))



# [1.55.0](https://github.com/lidofinance/staking-widget-ts/compare/1.54.0...1.55.0) (2023-03-06)


### Bug Fixes

* add actual gas limit for calc max amount ([2cf394d](https://github.com/lidofinance/staking-widget-ts/commit/2cf394df58ca6e45b998c96e156e03f8dd276748))
* error object nesting ([b3a20ed](https://github.com/lidofinance/staking-widget-ts/commit/b3a20ed30d5e132195eff7f42d5898e6f1cd9250))


### Features

* add calc maxFeePerGas for max amount ([fdb4f10](https://github.com/lidofinance/staking-widget-ts/commit/fdb4f10d4f2eef9d1be89b85321ec5f916185f49))
* change tx const to max tx cost for all operations ([0eb5db1](https://github.com/lidofinance/staking-widget-ts/commit/0eb5db1259308e21e69a089f5103e186be927e44))



# [1.54.0](https://github.com/lidofinance/staking-widget-ts/compare/1.53.0...1.54.0) (2023-02-22)


### Bug Fixes

* fix button hover color ([0402fc1](https://github.com/lidofinance/staking-widget-ts/commit/0402fc1bd8387b0c211e9315150f8bf15ab4ec0d))


### Features

* add explore defi buuton in succes modal ([e29528d](https://github.com/lidofinance/staking-widget-ts/commit/e29528d346d146b6c4de52d40e14bd1108d1f2f2))



# [1.53.0](https://github.com/lidofinance/staking-widget-ts/compare/1.52.0...1.53.0) (2023-02-21)


### Bug Fixes

* added missing folder ([2b49276](https://github.com/lidofinance/staking-widget-ts/commit/2b4927650a7ad2f35ff9fb8f7ec887d209ec5137))
* fix bff for rewards ([ea2c005](https://github.com/lidofinance/staking-widget-ts/commit/ea2c005686b29d6c8fb55ea9db2bd36bd83618d1))
* phrasing ([97ddde5](https://github.com/lidofinance/staking-widget-ts/commit/97ddde5696f7ba41fca5e2fcdd4329f07405b6f0))
* remove console log ([1a83047](https://github.com/lidofinance/staking-widget-ts/commit/1a83047b54fa590bd5a21b5f8a56e45de774f3c4))
* wording, spelling, escaped chars ([8a0682d](https://github.com/lidofinance/staking-widget-ts/commit/8a0682d56019840663fe4b4ba6dc6506d67f2d5b))


### Features

* add isMaxDisabled to all forms ([39fdfa5](https://github.com/lidofinance/staking-widget-ts/commit/39fdfa5c607f02f036966a2cf0cbd09dfd1c8c8a))
* add matomo event to token select on wrap ([8538bbf](https://github.com/lidofinance/staking-widget-ts/commit/8538bbfaa69ed9baf32d108be6ae5b54c5e80b9d))
* bump ts & moved playwright to the root ([d3f965f](https://github.com/lidofinance/staking-widget-ts/commit/d3f965f3caa071080ad70d20deb42cf1ba6f2360))
* disable button on zero balance ([5435ead](https://github.com/lidofinance/staking-widget-ts/commit/5435ead3eb383bf7cb459af99f7a778e4171c0ae))



