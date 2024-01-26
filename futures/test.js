const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'RbylZBGeoAys1HIP3mWD5JT7wd8MqJ2gzmb0YGQM6G',
  APISECRET: 'foFzRzh6zHbqh2oNvvqDNbvCa4m113u1630fxAcVkkl'
});

const fileUtils = require('../fileUtils');
const fetch = require('node-fetch');
var {
  generateIndicators
} = require('./indicators');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const Discord = require("discord.js");
const webhook = new Discord.WebhookClient('776017258564157442', 'TID_qcqYUROzy2naV-MzPgQBf5kFVQOF100c6eaMPDTcPw8');

//get currency status
//await binance.futuresExchangeInfo()
const crypto = require('crypto')

const {
  GoogleSpreadsheet
} = require('google-spreadsheet')

const creds = require('./google-credentials.json'); // the file saved above
const fs = require('fs');
const doc = new GoogleSpreadsheet('11uXOxpfZieOf5p2cyztssS3SNtA7YGUTE');

var _ = require('underscore');

const {
  RestClient,
  WebsocketClient
} = require('ftx-api');
const ws = new WebsocketClient({
  key: 'AYCUnemwv--qgwSb-WKDm5cEI',
  secret: 'ywNqtvLFNtU8MgNp8oqr7CRkttfx',
  // subAccountName: 'sub1',
});

//ws.on('response', msg => console.log('response: ', msg));
ws.on('update', msg => {
  console.log('update: ', msg)
  if (msg['channel'] === 'markets') {
    console.log(msg['data']['data']['DASH-PERP'])
  }
});
if (false) ws.subscribe({
  channel: 'trades',
  market: 'BTC-PERP'
});
//ws.on('error', msg => console.log('err: ', msg));

const FTXClient = new RestClient('AYCUnemwv-b9j1qgwSb-WKDm5cEI', 'ywNqtvTBKD8MgNp8oqr7CRkttfx');
(async () => {
  //console.info(await binance.futuresOpenOrders());
  console.log(await FTXClient.getOptionsAccountInfo())
  return
  console.log('buysome: ', await FTXClient.placeOrder({
    market: 'BTC-PERP',
    side: 'buy',
    type: 'market',
    size: 0.0004,
    price: null
  }));
  /* 
  {
success: true,
result: {
  id: 67787028704,
  clientId: null,
  market: 'BTC-PERP',
  type: 'market',
  side: 'buy',
  price: null,
  size: 0.0004,
  status: 'new',
  filledSize: 0,
  remainingSize: 0.0004,
  reduceOnly: false,
  liquidation: null,
  avgFillPrice: null,
  postOnly: false,
  ioc: true,
  createdAt: '2021-08-01T18:34:19.413234+00:00',
  future: 'BTC-PERP'
}
}
  */

  sad
  return
  let start = new Date()
  start.setMinutes(start.getMinutes() - 3)
  let prices = await FTXClient.getHistoricalPrices({
    market_name: 'BTC-PERP',
    resolution: 60,
    start_time: start.getTime() / 1000
  })
  console.log(prices)
  return

  //console.log(await FTXClient.getMarkets())
  console.log(await FTXClient.getMarkets())
  return
  var employeesCollection = [
    [1, 2, 3, 4, 5, 6, 7, 8]
    [9, 2, 4, 5, 6]
    [5, 3, 6, 7, 9]
  ];
  console.log(_.intersection(Object.values({
    id: 1,
    name: 'Soni',
    designation: 'SE',
    salary: 25000
  }), Object.values({
    id: 2,
    name: 'Soni',
    designation: 'SE',
    salary: 35000
  })))
  return
  console.info(await binance.futuresIncome());
  return
  let info = await binance.futuresExchangeInfo()
  console.log(info['symbols'].find(item => item['symbol'] === 'XRPUSDT'))
  return
  setInterval(async () => {
    let products = await binance.futuresPrices()
    fs.writeFileSync('./products.json', JSON.stringify(products, null, 3), {
      encoding: 'utf-8'
    })
    let array = []
    for (var a in products) {
      array.push(a)
    }
    console.log(array)
    console.log(crypto.createHash('sha256').update(JSON.stringify(array)).digest('base64'))
  }, 1000 * 5);
  return
  await doc.useServiceAccountAuth(creds)
  await doc.loadInfo()
  sheet = doc.sheetsByIndex[2];
  let rows = await sheet.getRows()
  console.log('rows', rows.length)

  console.info(await binance.futuresAllOrders("BTCUSDT"));
  return
  let price = await binance.futuresMarkPrice("BTCUSDT")
  price = +price['markPrice']
  //console.info( await binance.futuresAccount() );
  //binance.futuresBookTickerStream( console.log );
  //binance.futuresBookTickerStream( 'BTCUSDT', console.log );
  async function calculateDepth() {
    let depth = await binance.futuresDepth("CHRUSDT")
    depth = JSON.parse(JSON.stringify(depth))
    //console.info( depth );

    let price = +(await binance.futuresPrices())['CHRUSDT']
    let volume = 0

    depth['asks'].map(item => {
      if (item[0] <= price * 1.0005) {
        //console.log(+item[0] * +item[1])
        volume += +item[0] * +item[1]
      }
    })
    console.log(volume)
    calculateDepth()
  }
  let details = (await binance.futuresExchangeInfo())['symbols']
  //console.log(details)
  //console.log(details.find(item => item['symbol'] === 'BTCUSDT'))
  let decimals = details.find(item => item['symbol'] === 'BTCUSDT')['filters'][1]['minQty']
  console.log(await binance.futuresMarginType('BTCUSDT', 'CROSSED'))
  console.log(await binance.futuresLeverage('BTCUSDT', 2))
  let btc = 120 / price * 0.25
  let amount = Number(btc).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(decimals).countDecimals() + '})?'))[0]
  //console.log(usdt['availableBalance'] / price * 0.25) //amount in btc and 1/4
  console.log('amount', amount, +Number(price * 0.8).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + 2 + '})?'))[0])
  console.log(await binance.futuresMarketSell('BTCUSDT', 0.002, {
    newOrderRespType: 'RESULT'
  }))
  let buy = await binance.futuresMarketBuy('BTCUSDT', 0.001, {
    stopPrice: +Number(price * 1.0001).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + 2 + '})?'))[0],
    type: 'STOP_MARKET',
    workingType: 'MARK_PRICE',
    reduceOnly: true
  })
  console.info(buy, buy['clientOrderId'])

  return

  await sleep(30000)

  console.log(await binance.futuresCancel("BTCUSDT", {
    orderId: buy['orderId']
  }))

  console.log(await binance.futuresMarketBuy('BTCUSDT', amount, {
    reduceOnly: true,
    newOrderRespType: 'RESULT'
  }))
})()

Number.prototype.countDecimals = function () {
  //console.log('countDecimals',this.valueOf())
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  else if (this.toString().includes('1e')) return Number(this.toString().split('-')[1]);
  return this.toString().split(".")[1].length || 0;
}
