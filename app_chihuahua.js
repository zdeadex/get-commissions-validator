const axios = require('axios');
const converter = require('json-2-csv');
const fs = require('fs');
var finalOutput = [];


const lcdUrl = 'https://api.chihuahua.wtf'
const addVal = 'chihuahuavaloper13c2hcctczy695gfs5gc637tc844n6a9unlkaqv'
const udenom = 'uhuahua'
const denom = 'huahua'
const idCoinGeeko = 'chihuahua-token'
const fileName = 'commissionValidator_'+denom+'.csv'


async function getPrice(formattedDate) {
  // TODO
  const getPriceByDate = await axios('https://api.coingecko.com/api/v3/coins/'+idCoinGeeko+'/history?date='+formattedDate)
  var returnPrice = getPriceByDate.data.market_data.current_price.eur
  return returnPrice
}

async function start() {
  const allCommissions = await axios(lcdUrl + '/cosmos/tx/v1beta1/txs?events=message.sender=%27'+addVal+'%27&events=message.action=%27/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission%27') 

  console.log('Tx found: ' + allCommissions.data.tx_responses.length)
 
  await allCommissions.data.tx_responses.forEach(async function (item) { 
    var amountCoin = item.logs[1].events[0].attributes[1].value
      amountCoin = (amountCoin.replace(udenom, '')/1000000);
      var datum = Date.parse(item.timestamp)
      var date = new Date(datum);
      var formattedDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();


      (async () => {
          try {
            // var returnPrice = await getPrice(formattedDate)
            finalOutput.push({
              addressValidator: addVal,
              txhash: item.txhash,
              timestamp: item.timestamp,
              amount: amountCoin.toFixed(2)+' ' + denom,
              // priceData: returnPrice.toFixed(2)+'€',
              // amountEuro: (amountCoin*returnPrice).toFixed(2)+'€',
            })      
          } catch (err) {
              console.error(err)
          }
      })();
  })
  
  converter.json2csv(finalOutput, (err, csv) => {
    if (err) {
      throw err
    }
    console.log(csv)
    fs.writeFileSync(fileName, csv) 
    console.log('Export name: ' + fileName)
  });     
}

start()
