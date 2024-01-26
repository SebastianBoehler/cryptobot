var fs = require('fs');
//const fileUtils = require('../fileUtils');
const fetch = require('node-fetch');
const fileUtils = require('../fileUtils');
var {
  generateIndicators
} = require('./indicators');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'Rbylyyq6yow4viq5be3mWD5JT7wd8MqJ2gzmb0YGQM6G',
  APISECRET: 'RbylZBG6yow4viq5be3mWD5JT7wd8MqJ2gzmb0YGQM6G'
});

const crypto = require('crypto');

let volumes

async function getVolumes() {
  let daily = JSON.parse(JSON.stringify(await binance.futuresDaily()))
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
  array.sort(function (a, b) { return b['volume'] - a['volume'] })
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

async function main(symbol, mode, index, ruleNo) {
  console.log('\n')
  return new Promise(async (resolve, reject) => {
    let history = await fileUtils.loadData(symbol, 'BINANCE', 3)
      .catch(e => {
        console.error(e)
        return undefined
      })
    if (!history) {
      resolve()
      return
    }
    console.log(new Date().toLocaleTimeString())
    //(Number(Data1min[a]['time']) - Number(Data1min[a - 1]['time'])) / 1000 / 60

    let factor = 5
    let Indicators1min = await generateIndicators(1, symbol, factor - 3)
    //console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))

    let Indicators5min = await generateIndicators(5, symbol, factor - 3)
    let Indicators15min = await generateIndicators(15, symbol, factor)
    //console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))
    let Indicators90min = await generateIndicators(90, symbol, factor - 2)

    //console.log(Indicators15min['volatility'])

    //console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))
    if (!Indicators1min || !Indicators5min || !Indicators15min || !Indicators90min) {
      resolve()
      return
    }

    let price = history[history.length - 1]['price']

    console.log(symbol)
    //console.log(Indicators15min['eight'] / Indicators15min['fiftyfive'])
    //console.log(Indicators90min['eight'] / Indicators90min['twentyone'])
    //console.log(Indicators1min['RSI'], Indicators5min['RSI'], Indicators15min['RSI'])

    //console.log('90 twentyone', Indicators90min['twentyone'])
    console.log(Indicators15min)
    //console.log(new Date(parseFloat(Indicators15min['time'])).toLocaleString())

    let rule = {
      "Long Entry": [
        [
          //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
          //Indicators5min['eight'] >= Indicators5min['twentyone'],
          Indicators1min['RSI'] <= 65,
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
        //!(Indicators15min['latest'] >= Indicators15min['avg'] && Indicators15min['direction'] === 'down')
        Indicators15min['volatility']['latest'] >= Indicators15min['volatility']['avg'],
        Indicators15min['volatility']['direction'],
        Indicators90min['RSI'],
        Indicators5min['eight'] / Indicators5min['twentyone'] - 1,
        Indicators15min['eight'] / Indicators15min['twentyone'] - 1,
        Indicators90min['eight'] / Indicators90min['twentyone'] - 1,
        Indicators15min['RSI'],
        Math.abs(Indicators15min['eight'] - Indicators15min['twentyone']) / price
        //profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
      ]
    }

    //console.log(ruleIndicator)

    for (var b in ruleIndicator) {
      //if (profit <= -5) console.log(b, rule[b], ruleIndicator)
      if ((rule[b][ruleIndicator[b]].filter(item => item === true)).length === rule[b][ruleIndicator[b]].length) {
        ruleIndicator[b]++
      }
    }

    //console.log(rule)
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
      console.log('long entry')
      //obj['type'] = 'Long Entry'
      await sendSignal(symbol, price, 'Long Entry', '6', mode, index, rule['details'])
      //transactions.push(obj)
    } else if (ruleIndicator['Short Entry'] === rule['Short Entry'].length) {
      console.log('short entry')
      //obj['type'] = 'Short Entry'
      await sendSignal(symbol, price, 'Short Entry', '7', mode, index, rule['details'])
      //transactions.push(obj)
    }

    await sleep(50)

    //exits
    if (ruleIndicator['Long Exit'] === rule['Long Exit'].length) {
      console.log('long Exit')
      //obj['type'] = 'Long Exit'
      await sendSignal(symbol, price, 'Long Exit', '5', mode, index, rule['details'])
      //transactions.push(obj)
    } else if (ruleIndicator['Short Exit'] === rule['Short Exit'].length) {
      console.log('Short exit')
      //obj['type'] = 'Short Exit'
      await sendSignal(symbol, price, 'Short Exit', '4', mode, index, rule['details'])
      //transactions.push(obj)
    }

    await indicatorCountReset()

    await sleep(100)
    resolve()
  })

  //console.log(ruleIndicator)
}

trigger()

async function trigger() {
  volumes = await getVolumes()

  let symbols = await binance.futuresPrices()

  for (var a in symbols) {
    let volumeIndex = volumes.findIndex(item => item['symbol'] === a + 'PERP')
    console.log(a, volumeIndex)
    if (volumeIndex >= 25) continue
    await main(a + 'PERP', 'DEMO', 2)
  }
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

async function sendSignal(symbol, price, type, trigger, mode, index, details) {
  console.log('send signal', symbol, type, trigger, mode)
  let obj = {
    "ticker": symbol,
    "exchange": "binance",
    "action": type,
    "close": price,
    "message": "Provided by Boehler Signals",
    'source': 'scripted indicators',
    'trigger': trigger,
    'mode': mode,
    'index': index,
    'details': details
  }

  let boehlerHash = '885495e159862ebfa9c07345b90d13e30cd199180d51c8bce2b1ae8532f50e1b'
  await fetch(`http://boehler-trading.com/action?id=${boehlerHash}`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(obj),
    //redirect: 'follow'
  })
    .then(async resp => {
      let data = await resp.json()
      console.log(data['status'] !== 'success', data, trigger)
      if (data['status'] !== 'success') {
        sendSignal(symbol, price, type, 'response')
      }
    })
    .catch(e => {
      console.log(e.name)
      sendSignal(symbol, price, type, 'error')
    })
}
