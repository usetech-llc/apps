const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require('./config');
const stats = require("stats-lite")

const { BN } = require('bn.js');
const PERMILL = new BN(1_000_000);

async function main() {
  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ 
    provider: wsProvider,
    types: {
    }
  });

  // Reward Per Investment per validator
  let rewardPerInvestmentMap = {};


  const electedInfo = await api.derive.staking.electedInfo();
  const lastEra = await api.query.staking.currentEra();

  console.log("electedInfo.length = ", electedInfo.info.length);

  for (let e=0; e<83; e++) {
  // for (let e=0; e<7; e++) {
    let era = lastEra - e - 1;

    console.log(`Handling era ${era}`);
    for (let i=0; i<electedInfo.info.length; i++) {
    // for (let i=0; i<5; i++) {

      const validatorAddress = electedInfo.info[i].accountId.toString();
      // console.log(`Validator ${i} controller = `, electedInfo.info[i].controllerId.toString());
      // console.log(`Validator ${i} stash = `, electedInfo.info[i].accountId.toString());
  
      const exposure = await api.query.staking.erasStakers(era, electedInfo.info[i].accountId)
      // console.log(`${i}:`, exposure);
  
      const totalExposure = exposure.total;
  
      const eraReward = await api.query.staking.erasValidatorReward(era);
      const eraPrefs = await api.query.staking.erasValidatorPrefs(era, electedInfo.info[i].accountId)
      const commission = parseFloat(eraPrefs.commission.unwrap().div(PERMILL).toString()) / 1000.0;
  
      // console.log(`Prefs ${i}: `, commission);
  
      let rewardPerInvestment = 0;
      if (totalExposure > 0)
        rewardPerInvestment = eraReward * (1.0 - commission) / totalExposure;
  
      if (!(validatorAddress in rewardPerInvestmentMap)) {
        rewardPerInvestmentMap[validatorAddress] = [];
        console.log(`Creating key ${validatorAddress}`);
      }
  
      // console.log(`Adding reward ${rewardPerInvestment} for validator ${validatorAddress} in era ${era}`);
      rewardPerInvestmentMap[validatorAddress].push(rewardPerInvestment);
    }
  
  }

  console.log('');
  console.log(rewardPerInvestmentMap);
  console.log('');

  Object.keys(rewardPerInvestmentMap).forEach(function(key) {
    var val = rewardPerInvestmentMap[key];
    console.log(`${key},${stats.mean(val)},${stats.stdev(val)}`);
  });

}

main().catch(console.error).finally(() => process.exit());
