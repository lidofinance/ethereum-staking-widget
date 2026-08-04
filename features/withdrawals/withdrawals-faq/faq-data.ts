/**
 * FAQ content of the withdrawals pages — THE single source of truth.
 *
 * Consumed by:
 * - the React FAQ sections (`request-faq.tsx` / `claim-faq.tsx` via
 *   `faq-list.tsx`) — what users see;
 * - the build-time prerender (`shared/seo.ts`) — static body HTML +
 *   FAQPage JSON-LD for crawlers and no-JS readers.
 *
 * Kept import-free on purpose (this module loads inside vite.config.ts,
 * where tsconfig path aliases are unavailable):
 * - answers are limited HTML strings (p, ul/ol/li, b, span, a[href],
 *   data-matomo attributes for the delegated click tracking);
 * - internal tab links use absolute paths (upgraded to SPA navigation by
 *   `faq-list.tsx` at runtime); anchor links target the entry `id`s;
 * - external Lido origins are the canonical public defaults
 *   (env-dynamics.mjs fallbacks) — the static artifact is env-agnostic
 *   and these URLs do not vary across our deployments.
 *
 * NOT here: "Is there any minimum or maximum amount..." — its numbers come
 * from a live contract read; it stays a React component
 * (`list/unstake-amount-boundaries.tsx`) and is excluded from the static
 * prerender.
 */

export interface FaqEntry {
  /** Anchor id (drives AccordionNavigatable deep-linking at runtime). */
  id?: string;
  question: string;
  /** Limited HTML: p, ul/ol/li, b, span, a[href][data-matomo]. */
  answerHtml: string;
  /** Expanded on first render (before any anchor navigation applies). */
  defaultExpanded?: boolean;
}

const HELP_ORIGIN = 'https://help.lido.fi';
const ROOT_ORIGIN = 'https://lido.fi';
const NOWRAP = 'style="white-space: nowrap"';

const RISKS: FaqEntry = {
  id: 'lidoEngagingRisks',
  question: 'What are the risks of engaging with the Lido protocol?',
  defaultExpanded: true,
  answerHtml:
    '<p>There exist a number of potential risks when staking using the Lido protocol. Some of these risks include:</p>' +
    '<ul>' +
    '<li><span>Smart contract security</span><p>There is an inherent risk that Lido Protocol could contain a smart contract vulnerability or bug. The Lido code is open-sourced, audited and covered by an extensive <a href="https://immunefi.com/bounty/lido/" data-matomo="faqRisksOfStakingImmunefiBugBounty">Immunefi bug bounty program</a> to minimise this risk. To mitigate smart contract risks, all of the core Lido contracts are audited. Audit reports can be found <a href="https://github.com/lidofinance/audits#lido-protocol-audits" data-matomo="faqRisksOfStakingReports">here</a>.</p></li>' +
    '<li><span>Slashing risk</span><p>Validators risk staking penalties, with up to 100% of staked funds at risk if validators fail. To minimise this risk, Lido stakes across multiple professional and reputable node operators with heterogeneous setups, with additional mitigation in the form of self-coverage.</p></li>' +
    '<li><span>stToken price risk</span><p>Users risk an exchange price of stTokens which is lower than inherent value due to withdrawal restrictions on Lido protocol, making arbitrage and risk-free market-making impossible.</p></li>' +
    '</ul>' +
    `<p>For further information and details about these and other potential risks, please read carefully the <a href="${ROOT_ORIGIN}/terms-of-use">Terms of Use</a>.</p>` +
    '<p>Always conduct your own research and consult your own professional advisors to understand all potential risks before participating.</p>',
};

const WHAT_ARE_WITHDRAWALS: FaqEntry = {
  question: 'What are withdrawals?',
  answerHtml:
    '<p>Users can unstake their stETH or wstETH through withdrawals. Upon unstaking stETH, they will receive ETH at a 1:1 ratio. When unstaking wstETH, the unwrapping process will take place seamlessly in the background.</p>',
};

const WHAT_ARE_MY_OPTIONS: FaqEntry = {
  id: 'whatAreMyOptions',
  question: 'What are my options to exit staking?',
  answerHtml:
    '<p>Users have two ways to exit their staked position:</p>' +
    '<ol>' +
    '<li><b>Withdraw via Lido Withdrawals</b> - unstake and receive ETH at a 1:1 ratio after the withdrawal waiting period</li>' +
    '<li><b>Swap via CowSwap</b> - instantly exchange stETH or wstETH into other tokens directly using CowSwap through the Lido UI</li>' +
    '</ol>',
};

const WHAT_IS_THE_DIFFERENCE: FaqEntry = {
  id: 'whatIsTheDifference',
  question: 'What is the difference between withdrawal and swap?',
  answerHtml:
    '<p><b>Withdrawal via Lido:</b></p>' +
    '<ol><li>ETH at a fixed 1:1 rate</li><li>Requires waiting time (typically 1–5 days)</li><li>No price impact</li><li>Subject to queue and protocol conditions</li></ol>' +
    '<p><b>Swap via CowSwap:</b></p>' +
    '<ol><li>Instant execution</li><li>No waiting period</li><li>Market-based rate (may differ from 1:1)</li><li>Access to multiple assets</li><li>Powered by CowSwap</li></ol>',
};

const WHICH_ASSETS: FaqEntry = {
  id: 'whichAssets',
  question: 'Which assets can I receive when using swap?',
  answerHtml:
    '<p>When using CowSwap, you can swap your stETH or wstETH into: ETH, WETH, USDC, USDT, USDS and WBTC.</p>',
};

const HOW_DOES_WITHDRAWALS_WORK: FaqEntry = {
  question: 'How does the Lido withdrawal process work?',
  answerHtml:
    '<p>The withdrawal process is simple and has two steps:</p>' +
    '<ol>' +
    `<li><b>Request withdrawal</b>: Lock your stETH/wstETH by issuing a withdrawal request. ETH is sourced to fulfill the request, and then locked stETH is burned, which marks the withdrawal request as claimable. Under normal circumstances, this can take anywhere between <span ${NOWRAP}>1-5 days</span>.</li>` +
    '<li><b>Claim</b>: Claim your ETH after the withdrawal request has been processed.</li>' +
    '</ol>',
};

const HOW_TO_WITHDRAW: FaqEntry = {
  question: 'How do I withdraw?',
  answerHtml:
    '<p>Press the <a href="/withdrawals/request">Request tab</a>, choose an amount of stETH/wstETH to withdraw, then press ‘Request withdrawal’. Confirm the transaction using your wallet and press ‘Claim’ on the <a href="/withdrawals/claim">Claim tab</a> once it is ready.</p>',
};

const HOW_DO_I_SWAP: FaqEntry = {
  id: 'howDoISwap',
  question: 'How do I swap my stETH or wstETH?',
  answerHtml:
    '<p>In the Lido UI, select the DEX option powered by CowSwap, choose the token you want to receive, and confirm the transaction in your wallet. The swap will be executed without a withdrawal waiting period.</p>',
};

const CONVERT_STETH: FaqEntry = {
  question: 'Can I transform my stETH to ETH?',
  answerHtml:
    '<p>Yes, stakers can:</p>' +
    '<ol>' +
    '<li>transform their stETH to ETH 1:1 using the <a href="/withdrawals/request">Request</a> and <a href="/withdrawals/claim">Claim</a> tabs.</li>' +
    '<li>swap stETH to ETH instantly via CowSwap</li>' +
    '</ol>',
};

const CONVERT_WSTETH: FaqEntry = {
  question: 'Can I transform my wstETH to ETH?',
  answerHtml:
    '<p>Yes, you can:</p>' +
    '<ol>' +
    '<li>transform your wstETH to ETH using the <a href="/withdrawals/request">Request</a> and <a href="/withdrawals/claim">Claim</a> tabs. In that case note that, under the hood, wstETH will unwrap to stETH first, so your request or swap will be denominated in stETH</li>' +
    '<li>swap wstETH via CowSwap</li>' +
    '</ol>',
};

const WHY_STETH: FaqEntry = {
  question:
    'When I try to withdraw wstETH via Lido, why do I see the stETH amount in my request?',
  answerHtml:
    '<p>When you request to withdraw wstETH, it is automatically unwrapped into stETH, which then gets transformed into ETH. The main withdrawal period is when stETH is transformed into ETH. That’s why you see the amount pending denominated in stETH.</p>',
};

const HOW_LONG: FaqEntry = {
  question: 'How long does it take to withdraw via Lido?',
  answerHtml: `<p>On <a href="/withdrawals/request"><span ${NOWRAP}>Request tab</span></a> interface, you can see the current estimation of the withdrawal waiting time for new requests. The withdrawal request time depends on the requested amount, the overall amount of stETH in the queue, and <a href="#withdrawalsPeriod"><span ${NOWRAP}>other factors</span></a>.</p>`,
};

const WITHDRAWAL_PERIOD: FaqEntry = {
  id: 'withdrawalsPeriod',
  question: 'What are the factors affecting the withdrawal time?',
  answerHtml:
    '<ul>' +
    '<li>Demand for staking and unstaking.</li>' +
    '<li>The amount of stETH in the queue.</li>' +
    '<li>Protocols rules of finalization of requests.</li>' +
    '<li>Exit queue on the Beacon chain.</li>' +
    '<li>Performance of the validator poolside.</li>' +
    `<li>The protocol mode (<a href="#whatIsTurboMode"><span ${NOWRAP}>Turbo mode</span></a> or <a href="#whatIsBunkerMode"><span ${NOWRAP}>Bunker mode</span></a>)</li>` +
    '</ul>',
};

const REWARDS_AFTER: FaqEntry = {
  question: 'Do I still get rewards after I withdraw or swap?',
  answerHtml:
    '<p>No. After you request a withdrawal or execute a swap, the stETH/wstETH submitted will not receive staking rewards on top of your submitted balance.</p>',
};

const FEE: FaqEntry = {
  question: 'Is there a fee for withdrawal or swap?',
  answerHtml:
    '<p>There’s no withdrawal fee, but as with any Ethereum interaction, there will be a network gas fee. Lido does not collect a fee when you request a withdrawal. Swaps via CowSwap may include: market pricing differences, solver/execution fees, Lido fee, and Ethereum gas fees.</p>',
};

const WAITING_TIME_CHANGED: FaqEntry = {
  question:
    'Why my waiting time changed after I submitted the withdrawal request via Lido??',
  answerHtml: `<p>The waiting time could be changed due to <a href="#withdrawalsPeriod"><span ${NOWRAP}>several factors</span></a> affecting waiting time. That’s why it may either increase or decrease.</p>`,
};

const CLAIMABLE_DIFFERENCE_ANSWER =
  '<p>The amount you can claim may differ from your initial request due to a slashing occurrence and penalties. For these reasons, the total claimable reward amount could be reduced.</p>';

const CLAIMABLE_DIFFERENCE_REQUEST: FaqEntry = {
  id: 'amountDifferentFromRequested',
  question:
    'Why is the claimable amount may differ from my requested amount via Lido?',
  answerHtml: CLAIMABLE_DIFFERENCE_ANSWER,
};

const CLAIMABLE_DIFFERENCE_CLAIM: FaqEntry = {
  id: 'amountDifferentFromRequested',
  question: 'Why is the claimable amount different from my requested amount?',
  answerHtml: CLAIMABLE_DIFFERENCE_ANSWER,
};

const TURBO_MODE: FaqEntry = {
  id: 'whatIsTurboMode',
  question: 'What is Turbo mode?',
  answerHtml:
    '<p>Turbo mode is a default mode used unless an emergency event affects the Ethereum network. In Turbo Mode, withdrawal requests are fulfilled quickly, using all available ETH from user deposits and rewards.</p>',
};

const BUNKER_MODE: FaqEntry = {
  id: 'whatIsBunkerMode',
  question: 'What is Bunker mode?',
  answerHtml:
    '<p>Bunker mode is an emergency mode that activates under three worst-case conditions (when penalties are large enough to significantly impact the protocol’s rewards).</p>' +
    '<p>Importantly, Bunker mode allows for orderly withdrawals to be still processed, albeit more slowly, during chaotic tail-risk scenarios (e.g. mass slashings or a significant portion of validators going offline).</p>',
};

const BUNKER_REASONS: FaqEntry = {
  id: 'bunkerModeScenarios',
  question: 'What scenarios can cause Bunker mode?',
  answerHtml:
    '<p>Bunker mode is triggered under three conditions when the penalties might be big enough to have a significant impact on the protocol’s rewards:</p>' +
    '<ol>' +
    '<li>Mass slashing.</li>' +
    '<li>Penalties exceeding rewards in the current period between two Oracle reports.</li>' +
    `<li>Lower than expected Lido validators’ performance in the current period between two Oracle reports and penalties exceeding rewards at the end of <span ${NOWRAP}>it</span>.</li>` +
    '</ol>',
};

const SLASHING: FaqEntry = {
  question: 'What is slashing?',
  answerHtml:
    '<p>Slashing is a penalty that affects validators for intentional or accidental misbehavior.</p>' +
    '<p>Mass slashing event is when slashing penalties are big enough to have the impact on Protocol’s rewards in the current frame or in the future, esp. midterm penalties.</p>' +
    `<p>Slashing penalties are spread across stakers and may lower your total reward amount. For more information, check out <a href="${HELP_ORIGIN}/en/articles/5232780-what-are-staking-validator-penalties" data-matomo="withdrawalWhatAreStakingPenaltiesFAQ">What Are Staking/Validator Penalties</a>.</p>`,
};

const BUNKER_ONGOING: FaqEntry = {
  question:
    'If Bunker mode happens when I’ve already submitted a withdrawal request, do I need to wait longer?',
  answerHtml: `<p>Most often, the stETH/wstETH withdrawal period will be from <span ${NOWRAP}>1-5 days</span>. However, if any scenarios cause Bunker mode to happen, this could be extended.</p>`,
};

const SEPARATE_CLAIM: FaqEntry = {
  question: 'If I have several requests, can I claim them separately?',
  answerHtml:
    '<p>Yes. You can choose the requests you want to claim in the ‘Request List’ on the <a href="/withdrawals/claim">Claim tab</a>.</p>',
};

const LIDO_NFT: FaqEntry = {
  question: 'What is Lido NFT?',
  answerHtml:
    '<p>Each withdrawal request is represented by an NFT: the NFT is automatically minted for you when you send a request. You will need to add it to your wallet to be able to monitor the request status. When the request is ready for the claim, the NFT will change it’s appearance.</p>',
};

const ADD_NFT: FaqEntry = {
  question: 'How do I add the Lido NFT to my wallet?',
  answerHtml:
    '<p>Different wallets have specific functionality for adding and working with NFT. Most often, you need to find the specific NFT Address and Token ID. These parameters you can find on Etherscan. Visit Etherscan, add your wallet, and locate the NFT transaction. Once located, open the NFT transaction, and you will see the Address and Token ID.</p>' +
    `<p>If you are a MetaMask user, use <a href="${HELP_ORIGIN}/en/articles/7858367-how-do-i-add-the-lido-nft-to-metamask" data-matomo="withdrawalNFTGuideFAQ">this guide</a>.</p>`,
};

const NFT_NOT_CHANGE: FaqEntry = {
  question:
    'What could be the reason why my NFT’s view did not update even though my request was ready to be claimed?',
  answerHtml:
    '<p>Maybe your wallet doesn’t support the automatic changing of the NFT view. To renew the NFT, you can import the Address and Token ID of your NFT, and it could change it’s appearance to a new “Ready to claim” one.</p>',
};

/** Order mirrors the REQUEST page FAQ section. */
export const REQUEST_FAQ: FaqEntry[] = [
  RISKS,
  WHAT_ARE_WITHDRAWALS,
  WHAT_ARE_MY_OPTIONS,
  WHAT_IS_THE_DIFFERENCE,
  WHICH_ASSETS,
  HOW_DOES_WITHDRAWALS_WORK,
  HOW_TO_WITHDRAW,
  HOW_DO_I_SWAP,
  CONVERT_STETH,
  CONVERT_WSTETH,
  WHY_STETH,
  HOW_LONG,
  WITHDRAWAL_PERIOD,
  REWARDS_AFTER,
  FEE,
  WAITING_TIME_CHANGED,
  CLAIMABLE_DIFFERENCE_REQUEST,
  TURBO_MODE,
  BUNKER_MODE,
  BUNKER_REASONS,
  SLASHING,
  BUNKER_ONGOING,
  // the dynamic "min/max amount" entry renders here at runtime
  // (list/unstake-amount-boundaries.tsx) — excluded from static data
  LIDO_NFT,
  ADD_NFT,
  NFT_NOT_CHANGE,
];

/** Question AFTER which the dynamic unstake-boundaries accordion renders. */
export const REQUEST_FAQ_DYNAMIC_AFTER = BUNKER_ONGOING.question;

/** Order mirrors the CLAIM page FAQ section. */
export const CLAIM_FAQ: FaqEntry[] = [
  RISKS,
  WHAT_ARE_WITHDRAWALS,
  HOW_DOES_WITHDRAWALS_WORK,
  HOW_TO_WITHDRAW,
  CONVERT_STETH,
  CONVERT_WSTETH,
  WHY_STETH,
  SEPARATE_CLAIM,
  CLAIMABLE_DIFFERENCE_CLAIM,
  SLASHING,
  LIDO_NFT,
  ADD_NFT,
  NFT_NOT_CHANGE,
];
