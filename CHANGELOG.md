# [1.25.0](https://github.com/lidofinance/staking-widget-ts/compare/1.24.0...1.25.0) (2022-09-28)


### Bug Fixes

* change claim faq text ([00fdd06](https://github.com/lidofinance/staking-widget-ts/commit/00fdd06a96db5ff06b92856146bc6c520cc1637a))
* detection of connected xdefi wallet ([1d69cf9](https://github.com/lidofinance/staking-widget-ts/commit/1d69cf97256d35c8f373843df8a4b1079f37839f))
* fix show loading for eth balance ([7a785a0](https://github.com/lidofinance/staking-widget-ts/commit/7a785a0384574f4de82dc3013dd45e91adabccae))
* pull develop, fix conflicts ([39dc9b4](https://github.com/lidofinance/staking-widget-ts/commit/39dc9b4da6a15253c38650be8e991bc4511fde03))


### Features

* add xdefi wallet ([57437e2](https://github.com/lidofinance/staking-widget-ts/commit/57437e2e0475e8317abb111b859aaa241d041896))



# [1.24.0](https://github.com/lidofinance/staking-widget-ts/compare/1.23.0...1.24.0) (2022-09-26)


### Bug Fixes

* change oneinch cache ttl time to 5m ([3359119](https://github.com/lidofinance/staking-widget-ts/commit/3359119fbe07147966d813e687f20a6fc9fba14b))
* delete old cookies ([f0c158c](https://github.com/lidofinance/staking-widget-ts/commit/f0c158c914dd9385ea0fb8bdb731fd31e93d4d19))
* gitignore ([b233f89](https://github.com/lidofinance/staking-widget-ts/commit/b233f8926bddf8b38a750c5d42f339edf9350ba0))
* imports ([224d403](https://github.com/lidofinance/staking-widget-ts/commit/224d4039e754aa47b6b74089e219ed5f55c81d8f))
* minor types/linting fixes ([08d54c3](https://github.com/lidofinance/staking-widget-ts/commit/08d54c30e7f606ad4e19bcbdb191e3bc335a556c))
* naming ([495f08f](https://github.com/lidofinance/staking-widget-ts/commit/495f08f074ff36d38f06ba55e1eba7c4f376ecae))
* use shadowLight ([85c7fba](https://github.com/lidofinance/staking-widget-ts/commit/85c7fba5391f450eb3e95446558b7b31f35e0ebf))


### Features

* migration from old to new cookies ([bf514bd](https://github.com/lidofinance/staking-widget-ts/commit/bf514bdeb7ff184173ba31a331f56c332d5b4112))
* replaced standalone packages with lido-ui ([e71391c](https://github.com/lidofinance/staking-widget-ts/commit/e71391c81be9dde56640b9876cee68bd49d917b1))
* reverted to 1.22.0 ([9b03191](https://github.com/lidofinance/staking-widget-ts/commit/9b03191970cea7e191545930a4b4c50f86801a8d))
* using CSS variables for styling and relying on lido-ui CookieThemeProvider ([d54e3d0](https://github.com/lidofinance/staking-widget-ts/commit/d54e3d00b6e40312362f3aeb3a8eaf652d8035bd))
* working import of lido-ui v3 ([c4f2c9c](https://github.com/lidofinance/staking-widget-ts/commit/c4f2c9c47a528c583dffc8473fd88c037ab240ca))



# [1.23.0](https://github.com/lidofinance/staking-widget-ts/compare/1.22.0...1.23.0) (2022-09-14)


### Bug Fixes

* allow rpc methods for Ledger ([37ac4f7](https://github.com/lidofinance/staking-widget-ts/commit/37ac4f7f773d69603436c667b38bb17b58cc0cdb))
* collect metrics for first run ([890d306](https://github.com/lidofinance/staking-widget-ts/commit/890d306a73b16ab9e30671351d7a6fda465f93cf))
* fixed registry creation in dev mode ([9cf8501](https://github.com/lidofinance/staking-widget-ts/commit/9cf8501ebb96b7ca1c047a8a13d43ac590ba61b2))


### Features

* adjusted linter to understand js files ([84af114](https://github.com/lidofinance/staking-widget-ts/commit/84af114c34c51a637af75cb079fa3f303ca23bed))
* better port configuration ([2b70765](https://github.com/lidofinance/staking-widget-ts/commit/2b7076553493a8cb680c2bd0012c2452a94fe8fe))
* bumped curl version ([599c001](https://github.com/lidofinance/staking-widget-ts/commit/599c0019cc9ba9e86d8665418d2d4538ada340c0))
* fixed config & removed unused ignore in eslint ([1e9bd38](https://github.com/lidofinance/staking-widget-ts/commit/1e9bd38c9ab0a54a33e4e644d6b44499567d5ff1))
* metrics works with cluster ([bfbd9a4](https://github.com/lidofinance/staking-widget-ts/commit/bfbd9a4bd7d2c694810b2f64626f8ab6dc0c4057))
* moved unused vars eslint rule to general block ([3e15075](https://github.com/lidofinance/staking-widget-ts/commit/3e15075b62a07a4b7e90b31a6e1b1b736b8b5349))
* node-cluster runner ([dca5e37](https://github.com/lidofinance/staking-widget-ts/commit/dca5e3772a962f9ce147b4e83ab9398f503e6ab7))
* node-cluster runner ([35fc69c](https://github.com/lidofinance/staking-widget-ts/commit/35fc69cbb86e450ab17ba3d25af940faa12b0737))
* proxy request to metrics server ([afbfabf](https://github.com/lidofinance/staking-widget-ts/commit/afbfabfb2fbcff931668757724b3bbbf1901186b))
* show metrics in dev mode ([12e636c](https://github.com/lidofinance/staking-widget-ts/commit/12e636c9b4546725fb8f3eac649fa9600111be7b))
* use buildInfo version, instead of npm version ([fc2b230](https://github.com/lidofinance/staking-widget-ts/commit/fc2b230f9b16240876eb4bcf9927cb8b2b602a25))
* working cluster mode ([fbc0696](https://github.com/lidofinance/staking-widget-ts/commit/fbc06963796e642d83b61e7267142a23c8bf4c0b))



# [1.22.0](https://github.com/lidofinance/staking-widget-ts/compare/1.21.1...1.22.0) (2022-09-08)


### Bug Fixes

* add info about API wrappers in readme ([5e3ebe7](https://github.com/lidofinance/staking-widget-ts/commit/5e3ebe7c04121c346ee313f616eda4221f5f7f6c))
* add ready wrapper types, change wrapper args ([a85fdd6](https://github.com/lidofinance/staking-widget-ts/commit/a85fdd6c72754b5c55dd40779d1c5884340da50f))
* add removing cache-control to wrapper ([7b5c7af](https://github.com/lidofinance/staking-widget-ts/commit/7b5c7af4af823f85ccb555898b19d85dc26947c6))
* change dockerfile app curl version ([bc7be00](https://github.com/lidofinance/staking-widget-ts/commit/bc7be00211f90a08e3233566d1f249dd27ff5a94))
* change find headers for files in midddleware ([56106f6](https://github.com/lidofinance/staking-widget-ts/commit/56106f6badec1bc09fbc11aeec31b844ea34c5a5))
* fix readme ([d914ec1](https://github.com/lidofinance/staking-widget-ts/commit/d914ec1957d5b9a4b22bbf7bbc54a05dc96ce314))
* remove checking path ([abbcf1b](https://github.com/lidofinance/staking-widget-ts/commit/abbcf1bf959932953e9fb6df1647c559d9e364a5))
* update cache time ([730b405](https://github.com/lidofinance/staking-widget-ts/commit/730b405063391b2ec7b67b4f53d04e37f1efb3bc))
* update regexp ([dbe03e1](https://github.com/lidofinance/staking-widget-ts/commit/dbe03e1d80ef34add0497d946066fbf91d099828))


### Features

* add middleware for set cache headers, add list of paths for cache ([56e32d0](https://github.com/lidofinance/staking-widget-ts/commit/56e32d037273ded4d7010d0cfb229b52f5aa4335))
* add request wrapper for add functionality to requests, change middleware to use files only ([530475c](https://github.com/lidofinance/staking-widget-ts/commit/530475cee9b72291196af8fce570f8f6000708c9))
* add server error handler, add cache-control headers if error ([e77eb8d](https://github.com/lidofinance/staking-widget-ts/commit/e77eb8dec59e0d585f56e80397dd031c296c4827))
* wrap ldo-stats request ([08f4464](https://github.com/lidofinance/staking-widget-ts/commit/08f44648ee40ba9d5aeafd6725cdce667686feaa))



## [1.21.1](https://github.com/lidofinance/staking-widget-ts/compare/1.21.0...1.21.1) (2022-09-02)


### Bug Fixes

* fix dockerfile apk version ([c5cc96e](https://github.com/lidofinance/staking-widget-ts/commit/c5cc96e5affb2efcbc74da7b314229bbcde5e88d))



# [1.21.0](https://github.com/lidofinance/staking-widget-ts/compare/1.20.0...1.21.0) (2022-09-01)


### Bug Fixes

* handle gamestop wallet's default setting ([abed653](https://github.com/lidofinance/staking-widget-ts/commit/abed653532486ebc214ad95d56d4c2226c778132))


### Features

* add gamestop wallet ([04b2806](https://github.com/lidofinance/staking-widget-ts/commit/04b2806462ce63d2e62d5d307500e193b059641d))
* hide opera wallet ([4d41efa](https://github.com/lidofinance/staking-widget-ts/commit/4d41efacd5b2763b589b764bdb8df5276689d05a))



# [1.20.0](https://github.com/lidofinance/staking-widget-ts/compare/1.19.1...1.20.0) (2022-08-25)


### Features

* unhide zengo wallet ([69caccf](https://github.com/lidofinance/staking-widget-ts/commit/69caccf8dcaf040f7f9124f0c6a0b44dcb32347a))



## [1.19.1](https://github.com/lidofinance/staking-widget-ts/compare/1.19.0...1.19.1) (2022-08-24)


### Bug Fixes

* allow eth_blockNumber rpc method ([6685053](https://github.com/lidofinance/staking-widget-ts/commit/6685053b95403253ff3d7501bbc244b59c01b735))
* allow more rpc methods ([80e1bff](https://github.com/lidofinance/staking-widget-ts/commit/80e1bff1093db07f2b1b2f991d6490d19fef2d6d))
* allow rpc methods for Ledger ([14eaa24](https://github.com/lidofinance/staking-widget-ts/commit/14eaa241dcadd7bacc63a20ec81fcb89ed41f79b))



# [1.19.0](https://github.com/lidofinance/staking-widget-ts/compare/1.18.0...1.19.0) (2022-08-10)


### Bug Fixes

* 1inch banner adaptivity ([e0acc0d](https://github.com/lidofinance/staking-widget-ts/commit/e0acc0d9b9883e99cd33e155de68956b1df13bd3))
* 1inch copy ([b3b4934](https://github.com/lidofinance/staking-widget-ts/commit/b3b4934c98f2c00df17cafd2eca85de59f6910e2))
* allow full balance staking when limit unset ([9f98600](https://github.com/lidofinance/staking-widget-ts/commit/9f986005aff0ba77648a35fd7c465468224eccce))
* change 'pegged' to 'issued' ([29b284f](https://github.com/lidofinance/staking-widget-ts/commit/29b284f57357fc11305a4494148850915d9028e7))
* check if var true ([8ed0ddb](https://github.com/lidofinance/staking-widget-ts/commit/8ed0ddb3395e6315faf7941b5ece5657a013188a))
* connecting to exodus on mobile ([cab573d](https://github.com/lidofinance/staking-widget-ts/commit/cab573d862b5f2914475283794fa81bc16fb12fa))
* duplicated imports was removed ([5f72874](https://github.com/lidofinance/staking-widget-ts/commit/5f7287479eca761f33197ac0e62cd0b7ab1fd48e))
* max button limits ([591ed0b](https://github.com/lidofinance/staking-widget-ts/commit/591ed0b01301e4b735014214989662aa49ffe630))
* one inch link as anchor ([1e1515e](https://github.com/lidofinance/staking-widget-ts/commit/1e1515e4d5195481632ce83a49f3142a6c308459))
* one inch link usage ([fff305a](https://github.com/lidofinance/staking-widget-ts/commit/fff305a03299776213743a3fdc9385eaee09aacb))
* remove padding when current limit less than balance ([30d43a6](https://github.com/lidofinance/staking-widget-ts/commit/30d43a6c98b2ed7cd2211b323c26830340ccae72))
* revert mobile deeplink ([43d7458](https://github.com/lidofinance/staking-widget-ts/commit/43d7458e5bef83b23e6f232f03f03087b2e9bce9))
* staking limit warning update when data changed ([3d1d11d](https://github.com/lidofinance/staking-widget-ts/commit/3d1d11dd894891b710768c46ee5ed67c3118c3e3))
* staking limits pop-up copy ([d7803f4](https://github.com/lidofinance/staking-widget-ts/commit/d7803f455ed2d53b9a17b15424a0fe684d5133b6))


### Features

* account for stake limit ([f8ac87e](https://github.com/lidofinance/staking-widget-ts/commit/f8ac87ec5e48594b663d74372a26f01e5e5e5b2b))
* add a check for staking limit in stake input ([a596e07](https://github.com/lidofinance/staking-widget-ts/commit/a596e07424453acf1a063695fc46ad3b46d26b9a))
* add exodus wallet ([823e4fc](https://github.com/lidofinance/staking-widget-ts/commit/823e4fc52910276b02812e7c845ac832a5728cc1))
* add qa helpers for mocking limits ([e230c28](https://github.com/lidofinance/staking-widget-ts/commit/e230c28d52ea246b9fa602541b8ea4372b26135a))
* add stake limit reached modal view ([ecb97ad](https://github.com/lidofinance/staking-widget-ts/commit/ecb97adb6d1a8613f1f6100685a35b4d3337e3bc))
* added default formatters ([678208f](https://github.com/lidofinance/staking-widget-ts/commit/678208f3e8cd2287e980c90a5cff1badeac4e2b5))
* disable submit when limit reached ([8ec406f](https://github.com/lidofinance/staking-widget-ts/commit/8ec406fb2938ddd62a7f98a556c8c3bff6a1413d))
* display stakeable ether depending on limit ([c432129](https://github.com/lidofinance/staking-widget-ts/commit/c432129f6315e34777b842f1b7ae6733b5cbdc7d))
* display staking limit tooltip ([11015d7](https://github.com/lidofinance/staking-widget-ts/commit/11015d7df4458310af6eadb2b7f1591bad30b63f))
* enable blockchain.com wallet ([dcd1d55](https://github.com/lidofinance/staking-widget-ts/commit/dcd1d552322ecabe3f4e6152afaf1804396a5614))
* limit tooltip link ([1ca8f9c](https://github.com/lidofinance/staking-widget-ts/commit/1ca8f9c1dba1c51eb9dbc9b825a218008adeecf8))
* log level is text ([64c12d8](https://github.com/lidofinance/staking-widget-ts/commit/64c12d87650fc54aec6f3812332ff76519efbaf9))
* mock limit reached revert ([8dded49](https://github.com/lidofinance/staking-widget-ts/commit/8dded4998595e2110b48afb6881c7ee6254e84f5))
* one inch info box instead of modal ([7b8f042](https://github.com/lidofinance/staking-widget-ts/commit/7b8f0424a20c32072076e0de8a10c9ef229cb69a))
* staking limit auto refresh ([31ce786](https://github.com/lidofinance/staking-widget-ts/commit/31ce7862f9fe4f75cf0b390b8bcdb838abdd4888))
* staking limit icon update ([8b77dff](https://github.com/lidofinance/staking-widget-ts/commit/8b77dfffc8347b5db1692845a765faf6ffc01b6f))



# [1.18.0](https://github.com/lidofinance/staking-widget-ts/compare/1.16.2...1.18.0) (2022-08-04)


### Bug Fixes

* added missing blocked requests tracker ([d767dc1](https://github.com/lidofinance/staking-widget-ts/commit/d767dc12f3b816c0e0b8bc2e4df59b3bde6c33f9))
* rpcResponseCount was duplicating rpcResponseTime ([e80e504](https://github.com/lidofinance/staking-widget-ts/commit/e80e504e7a0f24739365602edfdae5264a8cd35f))
* supportedChains mistype + added few missing rpc methods ([e626187](https://github.com/lidofinance/staking-widget-ts/commit/e6261875edf2d8879620594247d9c4ed63fe2def))
* updated yarn.lock ([a7dfaa6](https://github.com/lidofinance/staking-widget-ts/commit/a7dfaa68879b252df296321e6c3f7a5b4419614b))


### Features

* added eth_getBalance to allowed methods ([ce722c1](https://github.com/lidofinance/staking-widget-ts/commit/ce722c16afcb3bfd2a380963e2ddf7dd1dabe9ab))
* added fetchRPCWithMetrics ([3d62fcb](https://github.com/lidofinance/staking-widget-ts/commit/3d62fcbd660a07c3ff5fce3fa650e361f53ccc38))
* added rpc provider with metrics ([0736aee](https://github.com/lidofinance/staking-widget-ts/commit/0736aee3fe5218af502be86f35d8ceb26d1f3c64))
* api-pages -> next pages & updated lockfile deps ([267ddd7](https://github.com/lidofinance/staking-widget-ts/commit/267ddd753309b5810d88acfc385bab20eca3ec6f))
* backend-blocks -> widget-blocks ([830dfa7](https://github.com/lidofinance/staking-widget-ts/commit/830dfa79024d222c13a1e865c123a0434445cc9c))
* before review fixes ([66f36f0](https://github.com/lidofinance/staking-widget-ts/commit/66f36f0753cdf101bb7ea27d8f9a69a264533710))
* better error handling for fetchRPC ([f489231](https://github.com/lidofinance/staking-widget-ts/commit/f48923128b7263ca7fb76825cdb4af47cfdba861))
* fetchRPC with callbacks ([dfb4863](https://github.com/lidofinance/staking-widget-ts/commit/dfb4863d675f074532f98a2745460f7710bbcf7b))
* get all packages from npm & updated packages ([cacf447](https://github.com/lidofinance/staking-widget-ts/commit/cacf447a7a7e9d7541560bad2fb18e8d925465f7))
* moved chains to utils folder ([37fbead](https://github.com/lidofinance/staking-widget-ts/commit/37fbead9309e750745477728dd71dbdfbc64c78f))
* moved metrics & health pages to backend-blocks ([0f51361](https://github.com/lidofinance/staking-widget-ts/commit/0f513618a16b1e1a7fc96a5c5568ce3cff3074fc))
* moved to new packages structure ([1e140a8](https://github.com/lidofinance/staking-widget-ts/commit/1e140a8b9f438163a808c7189509038823b69f3c))
* removed js-sdk fetch ([9398e53](https://github.com/lidofinance/staking-widget-ts/commit/9398e534e78f2be8e3c16be1c9f5124503410026))
* removed lido-js-sdk providers ([9c8d32e](https://github.com/lidofinance/staking-widget-ts/commit/9c8d32e301eb28f10f9a56ae569824c76f55a4f9))
* removed unused files ([31ea4d9](https://github.com/lidofinance/staking-widget-ts/commit/31ea4d9ad67c98d0589fafd52fefb5e6b7bc7539))
* slightly different fetch API ([1fffaba](https://github.com/lidofinance/staking-widget-ts/commit/1fffaba38be967f2537457e81904d797c95a34a8))
* somewhat working metrics ([0614bcc](https://github.com/lidofinance/staking-widget-ts/commit/0614bcc2ec297001754aa9955a3128635f9306d2))
* split fetchRPC into fetchRPC & iterateUrls ([7b99c03](https://github.com/lidofinance/staking-widget-ts/commit/7b99c0363416657aef689d32f95a3fcf1e4439c6))
* split patch metrics into patch callbacks and patch metrics ([59f2e4b](https://github.com/lidofinance/staking-widget-ts/commit/59f2e4b0138acdf0cdeb41ba4b8ded75e48c6c1c))
* updated allowlist rules ([6754da2](https://github.com/lidofinance/staking-widget-ts/commit/6754da273310cfeaead5010452969a3dd03ffc93))
* updated fetchRpc signature & added cachedFetchRPC ([f4a0d51](https://github.com/lidofinance/staking-widget-ts/commit/f4a0d51a8c2fef71a07d61ca7b7b571cb3fae62c))
* updated lidofinance deps ([add8c96](https://github.com/lidofinance/staking-widget-ts/commit/add8c96485802b9fa1ddb21f5f719fe90bda7003))
* updated lidofinance deps v2 ([174ffb7](https://github.com/lidofinance/staking-widget-ts/commit/174ffb7650a667025d667361c2634f0d70a9a05c))
* working with experimental fetch ([f5e7017](https://github.com/lidofinance/staking-widget-ts/commit/f5e7017dfcc5b122791fde6b1178a2ed81217c86))



