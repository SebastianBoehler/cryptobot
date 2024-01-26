var fs = require('fs');
//const fileUtils = require('../fileUtils');
const fetch = require('node-fetch');
const fileUtils = require('../fileUtils');
var {
  generateIndicators
} = require('./indicators');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
  process.exit()
  //webhook.send(error.message + '\n' + error.name)
});

const Discord = require("discord.js");
//https://discord.com/api/webhooks/832997472736641105/XWlsXwD4NSsuVJJz85JxbgiN0lXcr5jY0tccNRlhErCEGJezNpX
const webhook = new Discord.WebhookClient('8329974741105', 'XWlsXwD4NSsuzrEac85JxbgiN0lXcr5jY0tccNRlhErCEGJezNpX');

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'RbylZBGeoAys1HIPRYAviq5be3mWD5JT7wd8MqJ2gzmb0YGQM6G',
  APISECRET: 'RbylZByyq6yow4viq5be3mWD5JT7wd8MqJ2gzmb0YGQM6G'
});

const crypto = require('crypto');

let volumes

async function getVolumes() {
  let vol = await binance.futuresDaily()
    .catch(e => {
      console.log('error #1', e.message)
      return undefined
    })
  if (!vol) return []
  let daily = JSON.parse(JSON.stringify(vol))
  let array = []
  console.log('get volumes')

  for (var g in daily) {
    let item = daily[g]
    array.push({
      symbol: item['symbol'] + 'PERP',
      change: parseFloat(item['priceChange']),
      volume: parseFloat(item['quoteVolume']), //USDT
      change_percentage: parseFloat(item['priceChangePercent'])
    })
    //console.log(array.length)
  }
  array.sort(function (a, b) {
    return b['volume'] - a['volume']
  })
  return array
}

let dataset = process.argv[2]

let datasets = {
  '1': [{
    symbol: 'BTCUSDTPERP',
    mode: 'DEMO',
    index: 2
  }, {
    symbol: 'ETHUSDTPERP',
    mode: 'DEMO',
    index: 2
  }]
}

let symbolList = datasets['1']

let ruleIndicator = {
  "Long Entry": 0,
  "Long Exit": 0,
  "Short Entry": 0,
  "Short Exit": 0
}

async function main(symbol, mode, index, ruleName, ruleDetails) {
  //await sleep(1000 * 10)
  //console.log('\n')
  //console.log(symbol, ruleName, index)
  if (!symbol) return {
    hasSendSignal: false,
    sendEntrySignal: false
  }
  return new Promise(async (resolve, reject) => {
    let history = await fileUtils.loadData(symbol, 'BINANCE', 5)
      .catch(e => {
        console.error(e)
        return undefined
      })
    if (!history) {
      resolve()
      return
    }
    let hasSendSignal = false
    let sendEntrySignal = false
    //console.log(new Date().toLocaleTimeString())
    //(Number(Data1min[a]['time']) - Number(Data1min[a - 1]['time'])) / 1000 / 60

    let factor = 5
    let Indicators1min = await generateIndicators(1, symbol, factor - 3)
    //console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))

    let Indicators5min = await generateIndicators(5, symbol, factor - 4)
    let Indicators15min = await generateIndicators(15, symbol, factor)
    //console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))
    let Indicators90min = await generateIndicators(90, symbol, factor - 2)

    //console.log(Indicators15min['volatility'])

    //console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))
    if (!Indicators1min || !Indicators5min || !Indicators15min || !Indicators90min) {
      resolve({
        hasSendSignal,
        sendEntrySignal
      })
      return
    }

    let price = history[history.length - 1]['price']
    //console.log(Indicators15min['eight'] / Indicators15min['fiftyfive'])
    //console.log(Indicators90min['eight'] / Indicators90min['twentyone'])
    //console.log(Indicators1min['RSI'], Indicators5min['RSI'], Indicators15min['RSI'])

    //console.log('90 twentyone', Indicators90min['twentyone'])
    //console.log(Indicators90min)
    //console.log(new Date(parseFloat(Indicators15min['time'])).toLocaleString())
    let ruleStorage = {
      'origin': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test4': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['RSI_EMA'] >= Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['RSI_EMA'] <= Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test8': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators90min['RSI'] >= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators90min['RSI'] <= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test14': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators90min['RSI_EMA'] >= Indicators90min['RSI_EMA_prev'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators90min['RSI_EMA'] <= Indicators90min['RSI_EMA_prev'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test15': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['RSI_EMA'] >= Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['RSI_EMA'] <= Indicators5min['RSI_EMA_prev'], ,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test16': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['upper'] >= price,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['upper'] <= price,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test17': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['stochRSI']['k'] >= Indicators15min['stochRSI']['d'],
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['stochRSI']['k'] <= Indicators15min['stochRSI']['d'],
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test18': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['middle'] >= price,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['middle'] <= price,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] ////|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test19': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators90min['WilliamsR'] >= Indicators90min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators90min['WilliamsR'] <= Indicators90min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test20': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators15min['WilliamsR'] >= Indicators15min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators15min['WilliamsR'] <= Indicators15min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test21': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators15min['WilliamsR'] >= Indicators15min['WilliamsR_EMA'],
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators15min['WilliamsR'] <= Indicators15min['WilliamsR_EMA'],
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test22': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators90min['WilliamsR'] >= Indicators90min['WilliamsR_EMA'],
            Indicators90min['RSI'] >= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators90min['WilliamsR'] <= Indicators90min['WilliamsR_EMA'],
            Indicators90min['RSI'] <= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test23': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators5min['stochRSI']['k'] >= Indicators5min['stochRSI']['d'],
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators5min['stochRSI']['k'] <= Indicators5min['stochRSI']['d'],
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test24': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test25': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            //Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            //Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      //
      'test26': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            Indicators5min['RSI_EMA'] >= Indicators5min['RSI_EMA_prev'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            Indicators5min['RSI_EMA'] <= Indicators5min['RSI_EMA_prev'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test27': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators15min['WilliamsR'] >= Indicators15min['WilliamsR_EMA'],
            Indicators90min['WilliamsR'] >= Indicators90min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators15min['WilliamsR'] <= Indicators15min['WilliamsR_EMA'],
            Indicators90min['WilliamsR'] <= Indicators90min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test28': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            Indicators90min['WilliamsR'] >= Indicators90min['WilliamsR_EMA'],
            Indicators90min['RSI'] >= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            Indicators90min['WilliamsR'] <= Indicators90min['WilliamsR_EMA'],
            Indicators90min['RSI'] <= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test29': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test30': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['WilliamsR'] >= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['WilliamsR'] <= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test31': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['WilliamsR'] >= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['twentyone'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['WilliamsR'] <= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['twentyone'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test32': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators1min['WilliamsR'] >= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators90min['RSI'] >= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators1min['WilliamsR'] <= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators90min['RSI'] <= Indicators90min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test33': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators1min['WilliamsR'] >= 1['WilliamsR_EMA'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators1min['WilliamsR'] <= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test34': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators1min['WilliamsR'] >= 1['WilliamsR_EMA'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            //Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] >= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators1min['WilliamsR'] <= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            //Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators5min['WilliamsR'] <= Indicators5min['WilliamsR_EMA'],
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test35': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators5min['RSI_EMA'] > Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI_EMA'] > Indicators15min['RSI_EMA_prev'],
            //Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators5min['RSI_EMA'] < Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI_EMA'] < Indicators15min['RSI_EMA_prev'],
            //Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test36': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['heikinAshi']['close'] > Indicators1min['heikinAshi']['open'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['middle'] >= price,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['heikinAshi']['close'] < Indicators1min['heikinAshi']['open'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['middle'] <= price,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test37': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['WilliamsR'] >= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['WilliamsR'] >= Indicators15min['WilliamsR_EMA'],
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['WilliamsR'] <= Indicators1min['WilliamsR_EMA'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['WilliamsR'] <= Indicators15min['WilliamsR_EMA'],
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test38': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['middle'] >= price,
            Indicators5min['heikinAshi']['close'] > Indicators5min['heikinAshi']['open'],
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['middle'] <= price,
            Indicators5min['heikinAshi']['close'] < Indicators5min['heikinAshi']['open'],
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test39': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['heikinAshi']['close'] > Indicators1min['heikinAshi']['open'],
            //Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators90min['WilliamsR'] >= Indicators90min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['heikinAshi']['close'] < Indicators1min['heikinAshi']['open'],
            //Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators90min['WilliamsR'] <= Indicators90min['WilliamsR_EMA'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test40': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators1min['heikinAshi']['close'] > Indicators1min['heikinAshi']['open'],
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['middle'] >= price,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators1min['heikinAshi']['close'] < Indicators1min['heikinAshi']['open'],
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['middle'] <= price,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test41': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['middle'] >= price,
            Indicators5min['heikinAshi']['close'] > Indicators5min['heikinAshi']['open'],
            Indicators15min['RSI'] <= 60,
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['middle'] <= price,
            Indicators5min['heikinAshi']['close'] < Indicators5min['heikinAshi']['open'],
            Indicators15min['RSI'] >= 40,
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test42': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['RSI_EMA'] >= Indicators5min['RSI_EMA_prev'],
            Indicators5min['heikinAshi']['close'] > Indicators5min['heikinAshi']['open'],
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['RSI_EMA'] <= Indicators5min['RSI_EMA_prev'],
            Indicators5min['heikinAshi']['close'] < Indicators5min['heikinAshi']['open'],
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
      'test43': {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['heikinAshi']['open'] !== Indicators1min['heikinAshi']['high'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['BB']['middle'] >= price,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['heikinAshi']['open'] !== Indicators1min['heikinAshi']['low'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators5min['BB']['middle'] <= price,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      },
    }

    let rule = ruleStorage[ruleName]

    if (!rule) await webhook.send(`no rule ${ruleName}`)

    rule['details'] = {
      '1min': Indicators1min,
      '5min': Indicators5min,
      '15min': Indicators15min,
    }

    //console.log(symbol, ruleName)
    //console.log(symbol, ruleName, rule)

    //console.log(ruleIndicator)

    for (var b in ruleIndicator) {
      //if (profit <= -5) console.log(b, rule[b], ruleIndicator)
      if ((rule[b][ruleIndicator[b]].filter(item => item === true)).length === rule[b][ruleIndicator[b]].length) {
        ruleIndicator[b]++
      }
    }

    //console.log(symbol,ruleName, rule['Short Entry'], Indicators15min['RSI'])
    //console.log(transactions)

    async function calculateProfit(price) {
      let latestTransaction = transactions[transactions.length - 1]
      if (transactions.length >= 1 && latestTransaction['type'].includes('Entry')) {
        let entryPrice = latestTransaction['price']
        let difference = price / entryPrice

        let profit = 0
        if (latestTransaction['type'].includes('Long')) {
          profit = Number((difference - 1) * 100).toFixed(3)
        } else {
          profit = Number((difference - 1) * 100 * -1).toFixed(3)
        }
        //console.log('profit', profit, latestTransaction['type'])
        return Number(profit)
      } else return undefined
    }


    //entries
    if (ruleIndicator['Long Entry'] === rule['Long Entry'].length) {
      //console.log('long entry')
      //obj['type'] = 'Long Entry'
      await sendSignal(symbol, price, 'Long Entry', '6', mode, index, rule['details'], ruleName, ruleDetails)
      hasSendSignal = true
      sendEntrySignal = true
      //transactions.push(obj)
    } else if (ruleIndicator['Short Entry'] === rule['Short Entry'].length) {
      //console.log('short entry')
      //obj['type'] = 'Short Entry'
      await sendSignal(symbol, price, 'Short Entry', '7', mode, index, rule['details'], ruleName, ruleDetails)
      hasSendSignal = true
      sendEntrySignal = true
      //transactions.push(obj)
    }

    await sleep(50)

    //exits
    if (ruleIndicator['Long Exit'] === rule['Long Exit'].length) {
      //console.log('long Exit')
      //obj['type'] = 'Long Exit'
      await sendSignal(symbol, price, 'Long Exit', '5', mode, index, rule['details'], ruleName, ruleDetails)
      hasSendSignal = true
      //transactions.push(obj)
    } else if (ruleIndicator['Short Exit'] === rule['Short Exit'].length) {
      //console.log('Short exit')
      //obj['type'] = 'Short Exit'
      await sendSignal(symbol, price, 'Short Exit', '4', mode, index, rule['details'], ruleName, ruleDetails)
      hasSendSignal = true
      //transactions.push(obj)
    }

    await indicatorCountReset()

    //await sleep(100)
    resolve({
      hasSendSignal,
      sendEntrySignal
    })
  })

  //console.log(ruleIndicator)
}

trigger()

const {
  GoogleSpreadsheet
} = require('google-spreadsheet')

const creds = require('./google-credentials.json'); // the file saved above
const doc = new GoogleSpreadsheet('11uXOxpfZieOf5p27KqmuSl5drcyztssS3SNtA7YGUTE');

async function trigger() {
  await sleep(1000 * 16)
  volumes = await getVolumes()

  //let symbols = await binance.futuresPrices()

  if (volumes.length < 1) {
    await sleep(1000 * 10)
    trigger()
    return
  }

  async function login() {
    let failed = false
    await doc.useServiceAccountAuth(creds)
      .catch(e => {
        console.log('auth error', e.message)
        failed = true
      })
    if (failed) return failed
    await doc.loadInfo()
      .catch(async e => {
        console.log('load error', e.message)
        failed = true
      })
    return failed
  }

  let loginData = await login()
  if (loginData) {
    await sleep(1000 * 10)
    trigger()
    return
  }
  //console.log(doc.title);
  const sheet = doc.sheetsByIndex[2];
  const rows = await sheet.getRows() // can pass in { limit, offset }
    .catch(async e => {
      console.log('get rows', e.message)
      await sleep(2500)
      return await sheet.getRows().catch(e => {
        console.log('get rows', e.message)
        return undefined
      })
    })

  if (!rows) {
    await sleep(5000)
    trigger()
    return
  }

  let array = []
  let array2 = []
  let array3 = []

  let times = []

  times.sort(function (a, b) {
    return b - a
  });

  for (var b in rows) {
    let item = rows[b]
    let index = array.findIndex(obj => obj['symbol'] === item['Pair'])
    let prev = array[index]

    let expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() - 60)
    expiration = expiration.getTime()

    let difference = (parseFloat(new Date().getTime()) - parseFloat(item['Time'])) / 1000 / 60

    let volumeIndex = volumes.findIndex(item2 => item2['symbol'] === item['Pair'] + 'PERP')

    if (item['Pair'] === '1000SHIBUSDT' || item['Type']) continue
    else if (!item['Ratio 3h'] || !item['Hold Time'] || !item['Time']) continue
    if (item['Time'] < expiration || (item['Transactions'] < 2 && item['Pair'] !== 'BTCUSDT')) {
      if (+item['Transactions'] !== 0 && volumeIndex <= 20) console.log(item['Transactions'], item['Pair'], item['Rule'], 'outdated', volumeIndex)
      continue
    }
    else if (!item['Hold Time Old']) item['Hold Time Old'] = '100,0'

    times.push(difference)

    let holdTime = +item['Hold Time'].replace(',', '.')
    let holdTime1h = +item['Hold Time 1h'].replace(',', '.')
    let holdTime3h = +item['Hold Time 3h'].replace(',', '.')
    let holdTimeOld = +item['Hold Time Old'].replace(',', '.')

    //console.log(+item['Volatility'].replace(',', '.'), Math.abs(+item['Volatility'].replace(',', '.') - 1))

    array2.push({
      symbol: item['Pair'],
      'Leverage Profit': +item['Leverage Profit'].replace(',', '.').replace('%', ''),
      profit3h: +item['Profit 3h'].replace(',', '.').replace('%', ''),
      ratio: +item['Ratio'].replace(',', '.'),
      ratio3h: +item['Ratio 3h'].replace(',', '.'),
      ratio1h: item['Ratio 1h'] ? +item['Ratio 1h'].replace(',', '.') : null,
      holdTime: holdTime,
      holdTime3h: holdTime3h,
      holdTime1h: holdTime1h,
      holdTimeOld: holdTimeOld,
      rule: item['Rule'],
      trx: +item['Transactions'],
      trx3h: +item['Transactions 3h'],
      low: +item['Low'].replace(',', '.').replace('%', ''),
      high: +item['High'].replace(',', '.').replace('%', ''),
      'Trx diff': item['Trx diff'] ? +item['Trx diff'].replace(',', '.').replace('min', '') : null,
      Time: +item['Time'],
      Change: +item['Volatility'].replace(',', '.'),
      Volatility: Math.abs(+item['Volatility'].replace(',', '.') - 1)
      //row: b
    })
  }

  let rows2 = await doc.sheetsByIndex[4].getRows()

  for (var b in rows2) {
    let item = rows2[b]

    let expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() - 180)
    expiration = expiration.getTime()

    let difference = (parseFloat(new Date().getTime()) - parseFloat(item['Time'])) / 1000 / 60

    let volumeIndex = volumes.findIndex(item2 => item2['symbol'] === item['Pair'] + 'PERP')

    if (item['Pair'] === '1000SHIBUSDT' || item['Type']) continue
    else if (!item['Ratio 3h'] || !item['Hold Time'] || !item['Time']) continue
    if (item['Time'] < expiration || (item['Transactions'] < 2 && item['Pair'] !== 'BTCUSDT')) {
      if (+item['Transactions'] !== 0 && volumeIndex <= 20) console.log(item['Transactions'], item['Pair'], item['Rule'], 'outdated', volumeIndex)
      continue
    }
    else if (!item['Hold Time Old']) item['Hold Time Old'] = '100,0'

    //times.push(difference)

    let holdTime = +item['Hold Time'].replace(',', '.')
    let holdTime1h = +item['Hold Time 1h'].replace(',', '.')
    let holdTime3h = +item['Hold Time 3h'].replace(',', '.')
    let holdTimeOld = +item['Hold Time Old'].replace(',', '.')

    //console.log(+item['Volatility'].replace(',', '.'), Math.abs(+item['Volatility'].replace(',', '.') - 1))

    array3.push({
      symbol: item['Pair'],
      'Leverage Profit': +item['Leverage Profit'].replace(',', '.').replace('%', ''),
      profit3h: +item['Profit 3h'].replace(',', '.').replace('%', ''),
      ratio: +item['Ratio'].replace(',', '.'),
      ratio3h: +item['Ratio 3h'].replace(',', '.'),
      ratio1h: item['Ratio 1h'] ? +item['Ratio 1h'].replace(',', '.') : null,
      holdTime: holdTime,
      holdTime3h: holdTime3h,
      holdTime1h: holdTime1h,
      holdTimeOld: holdTimeOld,
      rule: item['Rule'],
      trx: +item['Transactions'],
      trx3h: +item['Transactions 3h'],
      low: +item['Low'].replace(',', '.').replace('%', ''),
      high: +item['High'].replace(',', '.').replace('%', ''),
      'Trx diff': item['Trx diff'] ? +item['Trx diff'].replace(',', '.').replace('min', '') : null,
      Time: +item['Time'],
      Change: +item['Volatility'].replace(',', '.'),
      Volatility: Math.abs(+item['Volatility'].replace(',', '.') - 1)
      //row: b
    })
  }

  console.log('oldest', times[0] + ' min')

  array2.forEach((item, index) => {
    let holdTimeNumber = Math.abs(item['holdTime3h'] / Math.max(...array2.map(row => row['holdTime3h'])) - 1)
    let trxDiffNum = item['Trx diff'] / Math.max(...array2.map(item => item['Trx diff']))
    let profitNumber = item['Leverage Profit'] < 0 ? 0 : item['Leverage Profit'] / Math.max(...array2.map(row => row['Leverage Profit']))
    let profitShortNumber = item['profit3h'] < 0 ? 0 : item['profit3h'] / Math.max(...array2.map(row => row['profit3h']))
    //console.log(item['profit_short'], profitShortNumber)
    array2[index]['BoehlerIndicator'] = holdTimeNumber * item['ratio3h'] * profitShortNumber * item['ratio1h'] * trxDiffNum
    if (isNaN(array2[index]['BoehlerIndicator'])) {
      //console.log(holdTimeNumber , item['ratio'] , item['ratio3h'] , profitShortNumber , item['ratio1h'])
      array2[index]['BoehlerIndicator'] = 0
    }
    array2[index]['BoehlerIndicator2'] = holdTimeNumber * item['ratio'] * item['ratio3h'] * profitShortNumber * trxDiffNum
    //console.log(array2[index]['BoehlerIndicator2'])
    //console.log(item['holdTime'], item['ratio'], item['ratio3h'], item['profit3h'], array2[index]['BoehlerIndicator'])
  });

  array3.forEach((item, index) => {
    let holdTimeNumber = Math.abs(item['holdTime3h'] / Math.max(...array3.map(row => row['holdTime3h'])) - 1)
    let trxDiffNum = item['Trx diff'] / Math.max(...array3.map(item => item['Trx diff']))
    let profitNumber = item['Leverage Profit'] < 0 ? 0 : item['Leverage Profit'] / Math.max(...array3.map(row => row['Leverage Profit']))
    let profitShortNumber = item['profit3h'] < 0 ? 0 : item['profit3h'] / Math.max(...array3.map(row => row['profit3h']))
    //console.log(item['profit_short'], profitShortNumber)
    array3[index]['BoehlerIndicator'] = holdTimeNumber * item['ratio3h'] * profitShortNumber * item['ratio1h'] * trxDiffNum
    if (isNaN(array3[index]['BoehlerIndicator'])) {
      //console.log(holdTimeNumber , item['ratio'] , item['ratio3h'] , profitShortNumber , item['ratio1h'])
      array3[index]['BoehlerIndicator'] = 0
    }
    array3[index]['BoehlerIndicator2'] = holdTimeNumber * item['ratio'] * item['ratio3h'] * profitShortNumber * trxDiffNum
    //console.log(array2[index]['BoehlerIndicator2'])
    //console.log(item['holdTime'], item['ratio'], item['ratio3h'], item['profit3h'], array2[index]['BoehlerIndicator'])
  });

  //sort array2 for boehler Indicator
  array2.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });

  array3.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });

  if (array2[0]) console.log('highest Boehler Indicator:', array2[0]['BoehlerIndicator'], array2[0]['rule'], array2[0]['symbol'])
  console.log('without Boehler', array2.filter(item => item['BoehlerIndicator'] === undefined).length)

  console.log('rows', array2.length, array3.length)
  //console.log(array2.slice(0, 2))
  let btcObject = array2.find(item => item['symbol'] === 'BTCUSDT' && item['rule'] === 'origin')
  if (btcObject) console.log('btc performance', btcObject['Leverage Profit'], btcObject['ratio1h'])
  else {
    console.log('no btc object')
    btcObject = {}
  }

  //let sendSignal = []
  let indexesSend = []
  for (var c in array2) {
    let ticker = array2[c]['symbol']
    let rule = array2[c]['rule']
    let volumeIndex = volumes.findIndex(item => item['symbol'] === ticker + 'PERP')
    let ruleTestIndex = array2.findIndex(item => item['symbol'] === ticker && item['rule'] === rule)
    //console.log(a, volumeIndex)
    let object = array2[ruleTestIndex]

    //console.log(rule, ticker ,object)
    //if (!object) console.log(array2[c], c, ruleTestIndex)
    if (object['Trx diff'] >= 120) continue

    let difference = (parseFloat(new Date().getTime()) - parseFloat(array2[c]['Time'])) / 1000 / 60
    //console.log(a, ruleTestIndex)
    let filters = {
      //17 with higher boehler without hold and higher ratio
      '1': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 10,
        object['holdTime'] > 30,
        object['ratio1h'] < 0.8,
        object['ratio3h'] < 0.85,
        object['profit3h'] < 15,
        //object['trx'] < 10,
        object['trx3h'] < 8,
        object['Trx diff'] > 20,
      ],
      '2': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['holdTime1h'] > 5,
        object['ratio1h'] < 0.8,
        object['ratio3h'] < 0.85,
        object['holdTime3h'] > 10,
        object['profit3h'] < 10,
        object['Trx diff'] > 35,
      ],
      '3': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        //object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //array2.length < 250,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.95
      ],
      //17 with higher Boehler and withour holdTime
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        //object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 300,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.85
      ],
      '4': [
        volumeIndex >= 25,
        ruleTestIndex >= 1, //top 5 rows
        ruleTestIndex < 0,
        object['profit3h'] < 5
      ],
      //duplicate of 17 higher ratio3
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        array2.length < 300,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      '5': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      '6': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 250,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      '7': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.80,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.85
      ],
      '8': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80,
        !array2.find(item => item['symbol'] === 'BTCUSDT' && item['trx'] >= 2)
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['ratio1h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 150,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.1
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['ratio1h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 150,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80,
        object['Trx diff'] > 35,
      ],
      '9': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80,
        object['Trx diff'] > 35,
      ],
      //shitty
      '10': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 8,
        object['BoehlerIndicator'] < 0.80,
        object['Trx diff'] > 35,
      ],
      //best performing
      '11': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['ratio1h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      '12': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] < 0.8,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //duplicate 17 some mods
      '13': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        //object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        object['holdTime1h'] > 15,
        //array2.length < 250,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      //shitty
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['BoehlerIndicator'] < 0.70,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
      ],
      //shitty
      '14': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['BoehlerIndicator'] < 0.70,
        object['ratio3h'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
      ],
      //shitty
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        //object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80,
        object['Trx diff'] > 35,
      ],
      '15': [
        //duplicate of 19 with higher ruleTestIndex
        volumeIndex >= 25,
        ruleTestIndex >= 5, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //nahhh
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5
      ],
      //duplicate of 16
      '16': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //duplicate of 16
      '17': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0,
        //object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //duplicate of 26 with higher ruleIndex
      '19': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //dupolicate of 17 with higher ruleTestIndex
      '20': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 250,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      //19 with array2 length filter
      '21': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
        array2.length < 250,
      ],
      //true to skip

      //31 + 32 unten dynamic
      '22': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.85,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['holdTime3h'] > 15,
        object['holdTime1h'] > 15,
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.90
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        //object['holdTime3h'] >= object['holdTimeOld'],
        object['holdTime3h'] > 15,
        object['holdTime1h'] > 10,
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] * 1.10 < object['high'],
        object['low'] < 0,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      '23': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] > 15,
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.10 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.85,
        object['Trx diff'] > 15,
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['ratio3h'] < 0.80,
        object['Leverage Profit'] < 10,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['holdTime1h'] > 15,
        object['ratio1h'] < 0.85,
        object['profit3h'] < 5,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['BoehlerIndicator'] < 0.6,
        object['profit3h'] < 5,
      ],
      '24': [
        volumeIndex >= 25,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 40,
        object['ratio1h'] < 0.9,
        object['ratio3h'] < 0.85,
        object['trx3h'] < 6,
        object['holdTime1h'] > 15,
      ],
      '25': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] < 0.9,
        object['holdTime1h'] > 18,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] < 0.9,
        object['holdTime1h'] > 18,
        object['ratio3h'] < 0.8,
        //object['trx'] < 10,
        object['trx3h'] < 6,
        object['Trx diff'] > 25,
        object['profit3h'] < 5
      ],
      //duplicate 17
      '26': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        object['ratio1h'] < 0.8,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      //duplicate 19
      '27': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //duplicate 25
      '28': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio'] < 0.7,
        object['ratio1h'] < 0.7
      ],
      '29': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio1h'] < 0.6
      ],
      //duplicate of 17
      '30': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['holdTime'] > 20,
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80,
        object['ratio1h'] < 0.65,
        object['Trx diff'] > 35,
      ],
      '40': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['holdTime'] > 20,
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80,
        object['ratio1h'] < 0.65,
        object['Trx diff'] > 35,
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['holdTime'] > 20,
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.70,
        object['ratio1h'] < 0.65,
        object['Trx diff'] > 35,
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['holdTime1h'] > 20,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio'] < 0.7,
        object['ratio1h'] < 0.85
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['holdTime1h'] > 20,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.8,
        object['ratio1h'] < 0.95
      ],
      //duplicate 25
      '31': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8
      ],
      '32': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.8,
        object['ratio3h'] > object['ratio1h'],
        object['ratio1h'] < 0.8
      ],
      //duplicate of 17
      '33': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] < 0.8,
        object['Trx diff'] > 35,
        //object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['Leverage Profit'] < 10,
        object['ratio1h'] < 0.85,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.70
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8,
        object['ratio'] < 0.6,
        object['holdTime1h'] > 15,
      ],
      //duplicate 17
      '34': [
        volumeIndex >= 25,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.95,
        object['Leverage Profit'] < 10,
        object['holdTime1h'] > 15,
        //object['low'] < 0
        object['Trx diff'] > 35,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      //duplicate of 52
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['holdTime1h'] > 15,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.95,
        object['BoehlerIndicator'] < 0.70
      ],
      //duplicate of 19
      '35': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['ratio1h'] < 0.9,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      '36': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['holdTime1h'] > object['holdTime3h'],
        object['holdTime3h'] > 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.9,
        difference < 15,
      ],
      //duplicate of 53
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        difference < 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8
      ],
      //duplicate of 53
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 5, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        difference < 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8
      ],
      '37': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        difference < 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8
      ],
      '38': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        difference < 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 35,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.8,
        !array2.find(item => item['symbol'] === 'BTCUSDT' && item['trx3h'] !== 0)
      ],
      //duplicate 35
      '39': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['holdTime3h'] > 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.9,
        difference < 15,
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] <= 0.95,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
      ],
      '40': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.9,
        object['ratio'] < 0.85,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 1,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] <= 0.95,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['ratio1h'] < 0.8
      ],
      //70
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] <= 0.95,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        btcObject['ratio1h'] < 0.5
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] <= 0.95,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        btcObject['ratio3h'] < 0.5 && btcObject['trx3h'] !== 0
      ],
      '41': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] <= 0.95,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        btcObject['ratio1h'] < 0.5 && btcObject['trx3h'] !== 0
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.9,
        object['ratio'] < 0.85,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
        btcObject['ratio1h'] < 0.5 && btcObject['trx3h'] !== 0
      ],
      //74
      '42': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.9,
        object['ratio'] < 0.85,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
        btcObject['ratio1h'] < 0.5 && btcObject['trx3h'] !== 0,
        difference > 15,
      ],
      //75
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.9,
        difference < 15,
      ],
      //duplicate of 65
      '43': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['holdTime3h'] > 15,
        object['trx3h'] < 4,
        object['Trx diff'] > 20,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.9,
        difference < 15,
      ],
      'old': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['holdTime3h'] > 12,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.85,
        object['ratio1h'] < 0.9,
        difference < 15,
      ],
      //copy of 68
      '44': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 1,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.10 < object['high'],
      ],
      '45': [
        volumeIndex >= 25,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['ratio3h'] < 0.8,
      ],
      '46': [
        volumeIndex >= 25,
        ruleTestIndex >= 12, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['ratio3h'] < 0.8,
      ],
      //17 without boehlerindicator
      '47': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['ratio1h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        //object['low'] < 0
        object['trx3h'] < 4,
        //object['BoehlerIndicator'] < 0.80
      ],
      //19 without boehler indicator
      '48': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] < 0.8,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        //object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      //78 with lower volIndex
      'old': [
        volumeIndex >= 10,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['ratio3h'] < 0.8,
      ],
      '49': [
        volumeIndex >= 25,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['ratio3h'] < 0.8,
        object['trx3h'] < 4,
        difference > 15,
      ],
      '50': [
        volumeIndex >= 25,
        ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['ratio3h'] < 0.8,
      ],
      'old': [
        volumeIndex >= 25,
        ruleTestIndex >= 1,
        ruleTestIndex < 0,
        object['ratio1h'] < 0.9
      ],
      '86': [
        volumeIndex >= 25,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 15,
        object['ratio3h'] < 0.8,
        object['Volatility'] < 0.05
      ],
      //duplicate of 68
      '87': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 1,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 1,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['Volatility'] < 0.05
      ],

    }

    //console.log('17', filters[17])

    //filters['31'] = array2.length >= 250 ? filters['17'] : (array2.length <= 120 ? filters['16'] : [true])

    //filters['old'] = array2.length >= 250 ? filters['17'] : (array2.length <= 100 ? filters['25'] : filters['16'])

    let detailsObj = object

    for (var a in filters) {
      detailsObj['filter'] = a
      detailsObj['ruleIndex'] = ruleTestIndex
      detailsObj['time_ago'] = (parseFloat(new Date().getTime()) - parseFloat(object['Time'])) / 1000 / 60
      //console.log(a, parseFloat(a))
      //TODO if already signal send skip this symbol
      //if (sendSignal.findIndex(item => item === a) >= 0) continue
      if (a === 'old') continue
      else if (filters[a].filter(item => item == true).length === 0 && !indexesSend.find(item => item === a)) {
        let {
          hasSendSignal,
          sendEntrySignal
        } = await main(ticker + 'PERP', 'DEMO', parseFloat(a), object['rule'], detailsObj)
        if (sendEntrySignal) {
          //console.log('push 1', a, indexesSend.length)
          indexesSend.push(a)
        }
        //if (hasSendSignal) await sleep(250)
        //sendSignal.push(a)
      } //else if (indexesSend.find(item => item === a)) console.log(a, 'already send signal')

      if (filters[a].filter(item => item == true).length === 0 && a === '68' && !indexesSend.find(item => item === 'live')) {
        console.log(!indexesSend.find(item => item === 'live'))
        let {
          hasSendSignal,
          sendEntrySignal
        } = await main(ticker + 'PERP', 'live', undefined, object['rule'], detailsObj)
        if (sendEntrySignal) indexesSend.push('live')
        //await sleep(100)
        //sendSignal.push(a)
      }
    }
  }

  await main('BTCUSDTPERP', 'DEMO', 18, 'origin', undefined)

  //disabled
  for (var c in array3) {
    let ticker = array3[c]['symbol']
    let rule = array3[c]['rule']
    let volumeIndex = volumes.findIndex(item => item['symbol'] === ticker + 'PERP')
    let ruleTestIndex = array3.findIndex(item => item['symbol'] === ticker && item['rule'] === rule)
    //console.log(a, volumeIndex)
    let object = array3[ruleTestIndex]

    //console.log(rule, ticker ,object)
    //if (!object) console.log(array2[c], c, ruleTestIndex)
    if (object['Trx diff'] >= 120) continue

    let difference = (parseFloat(new Date().getTime()) - parseFloat(array3[c]['Time'])) / 1000 / 60
    //console.log(a, ruleTestIndex)
    let filters = {
      //17 with higher boehler without hold and higher ratio
      '89': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        //object['low'] < 0
        object['trx3h'] < 8,
        object['BoehlerIndicator'] < 0.80,
        object['Trx diff'] > 35,
      ],
      //best performing
      '90': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.8,
        object['ratio1h'] < 0.8,
        object['Leverage Profit'] < 10,
        array2.length < 280,
        //object['low'] < 0
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.80
      ],
      '91': [
        volumeIndex >= 25,
        ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] <= 0.8,
        object['holdTime3h'] >= object['holdTimeOld'],
        object['profit3h'] < 0,
        object['ratio3h'] < 0.85,
        object['Leverage Profit'] < 10,
        object['low'] < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['ratio1h'] < 0.8,
        //object['trx'] < 10,
        object['trx3h'] < 4,
        object['BoehlerIndicator'] < 0.8,
        object['Trx diff'] > 35,
      ],
      '92': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 0.75,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.7,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
      ],
      '92': [
        volumeIndex >= 25,
        //ruleTestIndex >= 4, //top 5 rows
        ruleTestIndex < 0,
        object['Leverage Profit'] * 1.15 < object['high'],
        //object['trx'] < 10,
        object['holdTime3h'] > 12,
        object['trx3h'] < 4,
        object['Trx diff'] > 25,
        object['profit3h'] < 5,
        object['ratio3h'] < 0.75,
        object['ratio1h'] < 0.7,
        difference < 15,
      ],
      //copy of 68
      '94': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 0.7,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.7,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.10 < object['high'],
      ],
      '95': [
        volumeIndex >= 25,
        ruleTestIndex >= 1,
        ruleTestIndex < 0,
        object['ratio3h'] < 0.7
      ],
      '96': [
        volumeIndex >= 25,
        ruleTestIndex >= 8, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 20,
        object['ratio1h'] < 0.75,
        object['holdTime1h'] > 15,
        object['ratio3h'] < 0.7,
        object['Volatility'] < 0.05
      ],
      //duplicate of 68
      '97': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['Trx diff'] > 25,
        object['ratio1h'] < 0.7,
        object['holdTime1h'] > 15,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.7,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['Volatility'] < 0.05
      ],
      '98': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] < 0.8,
        object['Trx diff'] > 25,
        object['ratio1h'] < 0.85,
        object['holdTime1h'] > 10,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.85,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['Volatility'] < 0.05
      ],
      '99': [
        volumeIndex >= 25,
        //ruleTestIndex >= 3, //top 5 rows
        ruleTestIndex < 0,
        object['ratio'] < 0.65,
        object['Trx diff'] > 25,
        object['ratio1h'] < 0.6,
        object['holdTime1h'] > 15,
        object['holdTime3h'] > 25,
        object['ratio3h'] < 0.65,
        object['trx3h'] < 6,
        object['Leverage Profit'] * 1.15 < object['high'],
        object['Volatility'] < 0.05
      ],

    }

    //console.log('17', filters[17])

    //filters['31'] = array2.length >= 250 ? filters['17'] : (array2.length <= 120 ? filters['16'] : [true])

    //filters['old'] = array2.length >= 250 ? filters['17'] : (array2.length <= 100 ? filters['25'] : filters['16'])

    let detailsObj = object

    for (var a in filters) {
      detailsObj['filter'] = a
      detailsObj['ruleIndex'] = ruleTestIndex
      detailsObj['time_ago'] = (parseFloat(new Date().getTime()) - parseFloat(object['Time'])) / 1000 / 60
      //console.log(a, parseFloat(a))
      //TODO if already signal send skip this symbol
      //if (sendSignal.findIndex(item => item === a) >= 0) continue
      if (a === 'old') continue
      else if (filters[a].filter(item => item == true).length === 0 && !indexesSend.find(item => item === a)) {
        let {
          hasSendSignal,
          sendEntrySignal
        } = await main(ticker + 'PERP', 'DEMO', parseFloat(a), object['rule'], detailsObj)
        //console.log('state', state, filters[a], ticker)
        if (sendEntrySignal) {
          //console.log('push 2', a, indexesSend.length)
          indexesSend.push(a)
        }
        //if (hasSendSignal) await sleep(500)
        //await sleep(50)
        //sendSignal.push(a)
      } //else if (indexesSend.find(item => item === a)) console.log(a, 'already send signal')
    }
  }

  let BTCs = array2.filter(item => item['symbol'] === 'BTCUSDT')
  BTCs.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });
  //console.log(BTCs[0])
  if (BTCs.length >= 1 && BTCs[0]['profit3h'] > 0) await main('BTCUSDTPERP', 'DEMO', 100, BTCs[0]['rule'], BTCs[0])

  let ETHs = array2.filter(item => item['symbol'] === 'ETHUSDT')
  ETHs.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });
  if (ETHs.length >= 1 && ETHs[0]['profit3h'] > 0) await main('ETHUSDTPERP', 'DEMO', 101, ETHs[0]['rule'], ETHs[0])

  let BNBs = array2.filter(item => item['symbol'] === 'BNBUSDT')
  BNBs.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });
  if (BNBs.length >= 1 && BNBs[0]['profit3h'] > 0) await main('BNBUSDTPERP', 'DEMO', 102, BNBs[0]['rule'], BNBs[0])

  let ADAs = array2.filter(item => item['symbol'] === 'ADAUSDT')
  ADAs.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });
  if (ADAs.length >= 1 && ADAs[0]['profit3h'] > 0) await main('ADAUSDTPERP', 'DEMO', 103, ADAs[0]['rule'], ADAs[0])

  ADAs = array3.filter(item => item['symbol'] === 'ADAUSDT')
  ADAs.sort(function (a, b) {
    return b['BoehlerIndicator'] - a['BoehlerIndicator']
  });
  if (ADAs.length >= 1 && ADAs[0]['profit3h'] > 0) await main('ADAUSDTPERP', 'DEMO', 104, ADAs[0]['rule'], ADAs[0])

  console.log('indexes send array', indexesSend)
  console.log('done')

  await sleep(150)
  trigger()
}

async function indicatorCountReset() {
  ruleIndicator = {
    "Long Entry": 0,
    "Long Exit": 0,
    "Short Entry": 0,
    "Short Exit": 0
  }
}

async function sendSignal(symbol, price, type, trigger, mode, index, details, rule, ruleDetails) {
  if (type.includes('Entry')) console.log('send signal', symbol, type, rule, index, mode)
  let obj = {
    "ticker": symbol,
    "exchange": "BINANCE",
    "action": type,
    "close": price,
    "message": "Provided by Boehler Signals",
    'source': 'scripted indicators',
    'trigger': trigger,
    'mode': mode,
    'index': index,
    'details': details,
    'rule': rule,
    ruleDetails
  }

  if (mode === 'live' && index) throw `sending live signal for #${index}`

  let boehlerHash = '885495e159862ebfa9c07345b90d13e30cd199180d51c8bce2b1ae8532f50e1b'
  await fetch(`http://localhost:80/action?id=${boehlerHash}`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(obj),
    //redirect: 'follow'
  })
    .then(async resp => {
      let data = await resp.json()
      //console.log(data['status'] !== 'success', data, trigger)
      if (data['status'] !== 'success') {
        sendSignal(symbol, price, type, 'response', rule)
      }
    })
    .catch(e => {
      console.log(e.message)
      sendSignal(symbol, price, type, 'error', rule)
    })
}
