# Staking

Polkadot has extensive explanations how its (and Kusama’s) staking process works. Here we try to simplify those explanations and give you a solution where you don’t need to spend much time on it.

Validators are professional stakers, who run software needed to produce blocks on Kusama and have a highly available infrastructure that is needed to work well. Kusama has accumulated hundreds of validators (multiple are from the same organizations), and they all compete for Nominators. Nominators are people who own Kusama tokens (KSMs) and want to earn passive income on them. This solution makes it quick and easy to do so. 

# New Nomination

Here are the main steps:

1. Choose the wallet provider where your account was set up. We currently support only Polkadot.JS extension wallet and automatically detect your accounts there, all you need to do is allow us to do that. No other authorizations are made with that call. ;
2. If you have several accounts, choose the one that has your funds which you want to nominate. We will show you the available balance on that account and calculate and pre-fill the field for the amount of nomination with a maximum available (some funds need to remain in the account for transaction fees). Be aware – Kusama nomination can be stopped at any time, but after you do that, the network will take around 7 days to unbond your funds, during which you will not earn any income on them.
3. Click start and sign the transaction (actually, it is 2 transactions – bond and nominate, but we decided to save you time). You should get notifications of the successful transaction, which will submit your nominations in the next era (which changes every 6 hours). We will then take you to the next screen “Manage your nominations”, which will show your account and your nominated Validators as “Waiting nomination”. This will change to 1 “Active Nomination” and 15 Inactive Nominations when the era changes and your nomination gets in. 

# Manage nominations

Once you have nominated from your account(s) you will be shown a screen that allows you to manage your nominations. There you will be able to:

1. See your account(s), active nomination(s) and the bonded amount with the commission your currently active validator charges. If you click on the arrow on the right, you will see more details – your inactive and waiting nominations, as well as additional data on your account.
2. See your Rewards (currently an external report on Subscan)
3. Bond and nominate more funds to the same set of Validators (“Bond more” button)
4. “Update nomination” – change the validator set to the currently optimal one (see bellow more on that)
5. “Stop nomination” – simply stops nominating your funds to wait for either Unbond operation to free up your tokens or a new nomination.
6. “Unbond” – stops the nomination and starts the unbonding process, which takes about 7 days to complete.
7. Sing up for the notifications on your nomination via a Telegram bot created by @Ryabina. 
8. Go back to the New Nomination screen if you wish (for example if you have several accounts and you want to nominate from another one).

# Updating Nomination

While we carefully consider validators for the pool of the chosen 16 (see more on that bellow), Kusama active validator pool is pretty dynamic. This means that the chosen validators may become inactive (not producing blocks) and this will mean 0 income for you if they all become inactive.
For this reason we put in a signal on the “Update Nomination” if more then 8 validators from your pool become inactive. There is a fee for that transaction imposed by the network, so it does not make sense to do it too often. You may want to have your own signal for when to update the nomination, and this you can do via the Telegram notification bot. 

# How does our solution work

1. Other solutions for Kusama implement Polkadot’s high security approach of separating a Stash account and a Controller account. This approach is worth for very high worth accounts, while it is cumbersome to manage for an average or smaller amount. This solution uses same account for both functions (which is how it works in other blockchains), so you should be careful to protect it, as usual.
2. We combined the Bond and Nominate transactions into one click and signature (they are separate in other solutions). They are still 2 transactions (and require 2 transaction fees), but you don’t waste your time.
3. We provide an automatic validator selection algorithm for optimal performance. Our back end analyzes a number of factors for validator’s reliability/risk and returns. Choosing the validators is complicated and time-consuming process, which we believe is not applicable for most people. We created a solution that is designed to be more like a savings account. Be aware, slashing is possible even in best validators, even if we will exclude everyone that’s been slashed. 
