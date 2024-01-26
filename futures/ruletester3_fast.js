var fs = require('fs');
const fileUtils = require('../fileUtils');
const fetch = require('node-fetch');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
var {
  generateIndicators
} = require('./indicators');

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'RbylZBGeoAys1HIPRYAnhmWD5JT7wd8MqJ2gzmb0YGQM6G',
  APISECRET: 'RbylZBGeoAys1HIPRYAnhDjvyyq6yow4viq5J2gzmb0YGQM6G'
});
let port = Math.floor(1000 + Math.random() * 9000)
let factor = 5

const {
  GoogleSpreadsheet
} = require('google-spreadsheet');

const creds = require('./google-credentials.json'); // the file saved above
const doc = new GoogleSpreadsheet('11uXOxpf5p27KqmuSl5drcyztssS3SNtA7YGUTE');

var express = require("express");
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const Discord = require("discord.js");
//https://discord.com/api/webhooks/832997472736641105/XWlsXwD4NSsuVJJzlCeRZvISgsYzzrEac85JxbgiN0lXcr5jY0tccNRlhErCEGJezNpX
const webhook = new Discord.WebhookClient('832997472736641105', 'XWlsXwD4NSsuVJJzlCzrEac85JxbgiN0lXcr5jY0tccNRlhErCEGJezNpX');

process.on('unhandledRejection', (error, promise) => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message, promise);
  webhook.send('ruletester3_fast\n' + error.message + '\n' + promise)
  webhook.send(error.stack + '')
});

const crypto = require('crypto');
const { checkSchema, writeTransaction } = require('../fileUtils');

let resetDone = false
let writeToDatabase = false
main()

let endTime //= new Date('Mon Jun 28 2021 23:34:42 GMT+0000 (Coordinated Universal Time)').getTime()
let timeframe = 5
let customDate = new Date() //new Date('Sun Jun 13 2021 16:57:34 GMT+0000 (Coordinated Universal Time)')
customDate.setHours(customDate.getHours() - timeframe)

let volumes
let sheet

let value = 5
let index = value
schedule.scheduleJob('00 0 14 * * *', async function () {
  if (value === 0) {
    let data = await binance.futuresPrices()
      .catch(e => {
        console.log(e.message)
        return undefined
      })
    if (data) fs.writeFileSync('./products.json', JSON.stringify(data, null, 3), {
      encoding: 'utf-8'
    })
  }
  index = value
  resetDone = true
  console.log('trigger reset')
});
schedule.scheduleJob('00 0 2 * * *', async function () {
  if (value === 0) {
    let data = await binance.futuresPrices()
      .catch(e => {
        console.log(e.message)
        return undefined
      })
    if (data) fs.writeFileSync('./products.json', JSON.stringify(data, null, 3), {
      encoding: 'utf-8'
    })
  }
  index = value
  resetDone = true
  console.log('trigger reset')
});

async function getVolumes() {
  let vol = await binance.futuresDaily()
    .catch(e => {
      console.log(e.message)
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

async function main() {
  if (writeToDatabase) await checkSchema('ruletester')
  resetDone = false
  let products = fs.readFileSync('./products.json', {
    encoding: 'utf-8'
  })
  products = JSON.parse(products)
  volumes = await getVolumes()

  if (volumes.length < 1) {
    await sleep(1000 * 10)
    main()
    return
  }

  let tempArray = []

  for (var f in products) {
    //console.log(f, products[f])
    let symbol = f
    let volumeIndex = volumes.findIndex(item => item['symbol'] === symbol + 'PERP')
    if (volumeIndex >= 20) continue
    tempArray.push(f)
  }

  console.log('temp array', tempArray.length, tempArray)

  for (var a = index; a < tempArray.length; a++) {
    if (resetDone) continue
    let symbol = tempArray[a]
    let volumeIndex = volumes.findIndex(item => item['symbol'] === symbol + 'PERP')
    console.log('test', symbol, a)
    await tester(symbol, volumeIndex)
    console.log('test done')
    //result['port'] = port
    //result['end_time'] = new Date(endTime).toString()
  }
  customDate = new Date()
  customDate.setHours(customDate.getHours() - timeframe)
  endTime = undefined
  if (!resetDone) index = 0
  main()
}

async function tester(symbol, volumeIndex) {

  let rules = [
    'origin',
    'test4',
    'test8',
    'test14',
    'test15',
    'test16',
    'test17',
    'test18',
    'test19',
    'test20',
    'test21',
    'test22',
    'test23',
    'test24',
    'test25',
    'test26',
    'test27',
    'test28',
    'test29',
    'test30',
    'test31',
    'test32',
    'test33',
    'test34',
    'test35',
    'test36',
    'test37',
    'test38',
    'test39',
    'test40',
    'test41',
    'test42',
    'test43'
  ]
  console.log('load data for', symbol)
  let history = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
    .catch(e => {
      console.error(e)
      return undefined
    })
  if (!history) return

  if (false) history.forEach((item, a) => {
    //console.log(item, a)
    if (a >= 1) {
      let timeDifference = (Number(item['time']) - Number(history[a - 1]['time'])) / 1000 / 60
      if (timeDifference >= 2) {
        //console.log(new Date(Number(item['time'])))
        //console.log(new Date(Number(history[a - 1]['time'])))
        //console.log('----')
      }
    }
  })

  let leverage = 5

  let storageObject = {}

  //console.log('start date', new Date(Number(Data1min[500]['time'])).toLocaleString())

  for (var a = 9200; a < history.length; a = a + 1) { //9200
    leverage = 5
    if (!history[a]) {
      console.log('a', a, history[a], history.length)
    }
    let timestamp = parseFloat(history[a]['time'])
    let price = parseFloat(history[a]['close'])

    if (endTime && timestamp > endTime) continue
    if (!endTime && a >= history.length - 1) endTime = timestamp

    if (timestamp < customDate.getTime()) continue // || timestamp <= new Date('Fri, 01 Mar 2021 08:42:28 GMT').getTime() || timestamp <= 1617534943183
    //console.log('\n')
    console.log(`${symbol} | ${a}/${history.length} | ${new Date(timestamp).toLocaleString()}`)
    //console.log('\n')
    //await sleep(1000 * 1)
    if (a % 250 == 0 && !endTime) {
      console.log('refresh history')
      let temphistory = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
        .catch(e => {
          console.error(e)
          return undefined
        })
      if (temphistory && temphistory.length >= history.length - 10) history = temphistory
    } else if (a >= history.length - 15) {
      //wait
    }

    let Indicators1min = await generateIndicators(1, symbol + 'PERP', factor - 3, a)
    let Indicators5min = await generateIndicators(5, symbol + 'PERP', factor - 4, a)
    let Indicators15min = await generateIndicators(15, symbol + 'PERP', factor, a)
    //let Indicators60min = await generateIndicators(60, symbol + 'PERP', factor, a - 2)
    let Indicators90min = await generateIndicators(90, symbol + 'PERP', factor - 2, a)

    if (!Indicators1min || !Indicators5min || !Indicators15min || !Indicators90min) {
      a--
      continue
    }

    //console.log(Indicators15min)
    //if (transactions.length >= 2) break

    let testTimeframe = new Date()
    testTimeframe.setHours(testTimeframe.getHours() - 48)
    testTimeframe = testTimeframe.getTime()

    let lastJump = undefined

    //if (lastTwo === 2) leverage = 10
    //console.log(Indicators15min)
    //if (transactions.length >= 4) break
    //console.log('abs', Math.abs(Indicators15min['eight'] - Indicators15min['thirteen']) / price)

    for (var u in rules) {
      //console.log('---------------------------------------------------')
      //console.log('\n')
      let rule = rules[u]
      //console.log('rule', rule)
      if (!storageObject[rule]) storageObject[rule] = {
        ruleIndicator: {
          "Long Entry": 0,
          "Long Exit": 0,
          "Short Entry": 0,
          "Short Exit": 0
        },
        transactions: []
      }
      let transactions = storageObject[rule]['transactions']

      let profit = await calculateProfit(price, rule)

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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
          ]
        },
        //test18 duplicate
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
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
              Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
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
              Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99
            ]
          ],
          'details': [
            Indicators15min['fiftyfive'],
            profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
          ]
        },
      }

      //console.log('rule Indicator',storageObject[rule]['ruleIndicator'])
      //console.log('rule indicator amount', ruleStorage[rule]['Short Entry'][0].length)
      //console.log('transactions', transactions.length)

      for (var b in storageObject[rule]['ruleIndicator']) {
        //ruleStorage[u]
        //console.log('-------')
        //console.log(storageObject[rule]['ruleIndicator'])
        let index = storageObject[rule]['ruleIndicator'][b]
        //console.log('1', b, rule, ruleStorage[u])
        //console.log(rule, b, index)
        if ((ruleStorage[rule][b][index].filter(item => item === true)).length === ruleStorage[rule][b][index].length) {
          storageObject[rule]['ruleIndicator'][b]++
          //console.log('increase', rule, b)
        }
      }

      //console.log(ruleStorage[rule])

      //console.log(rule, storageObject[rule]['ruleIndicator'])
      //console.log('transactions', rule, transactions.length)

      let number = 1
      let exits = transactions.filter(item => item['type'].includes('Exit'))

      for (var g in exits) {
        let profit = parseFloat(exits[g]['leverageProfit'])
        number = number * (1 + profit / 100)
      }

      //console.log('general Profit', rule, number)

      if (transactions.length !== 0 && transactions[transactions.length - 1]['type'].includes('Entry')) {
        //console.log('profit', profit)
        //exit order next
        storageObject[rule]['ruleIndicator']['Long Entry'] = 0
        storageObject[rule]['ruleIndicator']['Short Entry'] = 0

        let latestTransaction = transactions[transactions.length - 1]

        let timeDifference = (Number(history[a]['time']) - Number(history[a - 1]['time'])) / 1000 / 60
        if (timeDifference >= 5) {
          lastJump = Number(history[a]['time'])
          console.error('database jump', new Date(timestamp).toLocaleString())
          transactions.slice(-1, 1)
          indicatorCountReset(rule)
          continue
        }

        let generalProfit = 1
        let exits = transactions.filter(item => item['type'].includes('Exit'))
        exits.forEach(item => {
          //result['profit'] = Number(result['profit'] * (1 + item['profit'] / 100)).toFixed(5)
          generalProfit = generalProfit * (1 + item['leverageProfit'] / 100)
          //console.log((1 + item['leverageProfit'] / 100), result['leverageProfit'])
        })

        let obj = {
          price: price,
          time: timestamp,
          timestamp: new Date(timestamp).toLocaleString(),
          type: null,
          profit: parseFloat(profit),
          leverageProfit: profit * leverage,
          details: rule['details'],
          holdLength: (latestTransaction['time'] - new Date(timestamp).getTime()) / 1000 / 60 * -1 + 'min',
          generalProfit: generalProfit,
          testIndicators: null
        }

        if (latestTransaction['type'].includes('Short')) {
          //Short exit
          //console.log(obj['generalProfit'])
          storageObject[rule]['ruleIndicator']['Long Exit'] = 0
          if (storageObject[rule]['ruleIndicator']['Short Exit'] === ruleStorage[rule]['Short Exit'].length) {
            //console.log(obj['generalProfit'], new Date(timestamp).toLocaleString(), 'Short Exit', rule)
            //console.log('Short exit', new Date(timestamp).toLocaleTimeString())
            obj['type'] = 'Short Exit'
            obj['action'] = obj['type']
            obj['profit'] = obj['profit'] * 0.999
            obj['leverageProfit'] = obj['profit'] * leverage
            //obj['testIndicators'] = await returnTestIndicators('short')
            //if (rule['details'][1] === 'stop loss') console.log('stop loss', obj['type'], rule['details'][2])
            transactions.push(obj)
            if (writeToDatabase) {
              obj['holdDuration'] = obj['holdLength']
              obj['symbol'] = symbol
              await writeTransaction('ruletester', {
                index: rule.match(/\d+/) ? +rule.match(/\d+/)[0] : undefined,
                symbol: symbol,
                time: new Date().getTime(),
                price: price,
                avgPrice: 0,
                action: 'Short Exit',
                status: 'DEMO',
                orderId: undefined,
                data: obj
              })
            }
            indicatorCountReset(rule)
          }
        } else {
          //Long exit
          //console.log(obj['generalProfit'])
          storageObject[rule]['ruleIndicator']['Short Exit'] = 0
          if (storageObject[rule]['ruleIndicator']['Long Exit'] === ruleStorage[rule]['Long Exit'].length) {
            //console.log(obj['generalProfit'], new Date(timestamp).toLocaleString(), 'Long Exit', rule)
            //console.log('long Exit', new Date(timestamp).toLocaleTimeString())
            obj['type'] = 'Long Exit'
            obj['action'] = obj['type']
            obj['profit'] = obj['profit'] * 0.999
            obj['leverageProfit'] = obj['profit'] * leverage
            //obj['testIndicators'] = await returnTestIndicators('long')
            //if (rule['details'][1] === 'stop loss') console.log('stop loss', obj['type'], rule['details'][2])
            transactions.push(obj)
            if (writeToDatabase) {
              obj['holdDuration'] = obj['holdLength']
              obj['symbol'] = symbol
              await writeTransaction('ruletester', {
                index: rule.match(/\d+/) ? +rule.match(/\d+/)[0] : undefined,
                symbol: symbol,
                time: new Date().getTime(),
                price: price,
                avgPrice: 0,
                action: 'Long Exit',
                status: 'DEMO',
                orderId: undefined,
                data: obj
              })
            }
            indicatorCountReset(rule)
          }
        }

      } else {
        //entry order next
        storageObject[rule]['ruleIndicator']['Long Exit'] = 0
        storageObject[rule]['ruleIndicator']['Short Exit'] = 0
        //console.log('entry next')

        let obj = {
          price: price,
          time: timestamp,
          timestamp: new Date(timestamp).toLocaleString(),
          type: null,
          details: rule['details'],
          testIndicators: null
        }

        //console.log('check entry conditions', storageObject[rule]['ruleIndicator']['Long Entry'], ruleStorage[rule]['Long Entry'].length)

        //long
        if (storageObject[rule]['ruleIndicator']['Long Entry'] === ruleStorage[rule]['Long Entry'].length) {
          //console.log('long entry', new Date(timestamp).toLocaleTimeString(), rule)
          obj['type'] = 'Long Entry'
          obj['action'] = obj['type']
          //obj['testIndicators'] = await returnTestIndicators('long')
          transactions.push(obj)
          if (writeToDatabase) {
            //obj['holdDuration'] = obj['holdLength']
            obj['symbol'] = symbol
            obj['details'] = {
              '1min': Indicators1min,
              '5min': Indicators5min,
              '15min': Indicators15min,
            }
            await writeTransaction('ruletester', {
              index: rule.match(/\d+/) ? +rule.match(/\d+/)[0] : undefined,
              symbol: symbol,
              time: new Date().getTime(),
              price: price,
              avgPrice: 0,
              action: 'Long Entry',
              status: 'DEMO',
              orderId: undefined,
              data: obj
            })
          }
          indicatorCountReset(rule)
        } else if (storageObject[rule]['ruleIndicator']['Short Entry'] === ruleStorage[rule]['Short Entry'].length) {
          //console.log('short entry', new Date(timestamp).toLocaleTimeString(), rule)
          obj['type'] = 'Short Entry'
          obj['action'] = obj['type']
          //obj['testIndicators'] = await returnTestIndicators('short')
          transactions.push(obj)
          if (writeToDatabase) {
            //obj['holdDuration'] = obj['holdLength']
            obj['symbol'] = symbol
            obj['details'] = {
              '1min': Indicators1min,
              '5min': Indicators5min,
              '15min': Indicators15min,
            }
            await writeTransaction('ruletester', {
              index: rule.match(/\d+/) ? +rule.match(/\d+/)[0] : undefined,
              symbol: symbol,
              time: new Date().getTime(),
              price: price,
              avgPrice: 0,
              action: 'Short Entry',
              status: 'DEMO',
              orderId: undefined,
              data: obj
            })
          }
          indicatorCountReset(rule)
        }
      }

      //storageObject[rule]['transactions'] = transactions
    }

    //console.log(storageObject)

    let testIndicators = {
      '1MIN_RSI': {
        long: Indicators1min['RSI_EMA'] >= Indicators1min['RSI_EMA_prev'],
        short: Indicators1min['RSI_EMA'] <= Indicators1min['RSI_EMA_prev']
      },
      '5MIN_RSI': {
        long: Indicators5min['RSI'] <= 65,
        short: Indicators5min['RSI'] >= 35
      },
      '1MIN_RSI_MOVING': {
        long: Indicators1min['fast_RSI'] >= Indicators1min['slow_RSI'],
        short: Indicators1min['fast_RSI'] <= Indicators1min['slow_RSI']
      },
      '5MIN_RSI_MOVING': {
        long: Indicators5min['fast_RSI'] >= Indicators5min['slow_RSI'],
        short: Indicators5min['fast_RSI'] <= Indicators5min['slow_RSI']
      },
      '15MIN_RSI_MOVING': {
        long: Indicators15min['fast_RSI'] >= Indicators15min['slow_RSI'],
        short: Indicators15min['fast_RSI'] <= Indicators15min['slow_RSI']
      },
      '5MIN_EMA': {
        long: Indicators5min['eight'] >= Indicators5min['thirteen'],
        short: Indicators5min['eight'] <= Indicators5min['thirteen']
      }
    };

    async function returnTestIndicators(type) {
      let test = {}
      for (var t in testIndicators) {
        test[t] = testIndicators[t][type]
      }
      return test
    };

    async function calculateProfit(price, i) {
      let transactions = storageObject[i]['transactions']
      let latestTransaction = transactions[transactions.length - 1]
      if (transactions.length >= 1 && latestTransaction['type'].includes('Entry')) {
        let entryPrice = latestTransaction['price']
        let difference = price / entryPrice

        let profit = 0
        if (latestTransaction['type'].includes('Long')) {
          profit = Number((difference - 1) * 100).toFixed(3)
          //if (high_p >= 0.5) profit = 0.5
          //else if (low_p <= -1) profit = -1
        } else {
          profit = Number((difference - 1) * 100 * -1).toFixed(3)
          //if (high_p <= -1) profit = -1
          //else if (low_p >= 0.5) profit = 0.5
        }
        //console.log('profit', profit, latestTransaction['type'])
        return Number(profit)
      } else return undefined
    };

    async function indicatorCountReset(o) {
      storageObject[o]['ruleIndicator'] = {
        "Long Entry": 0,
        "Long Exit": 0,
        "Short Entry": 0,
        "Short Exit": 0
      }
    };

    async function getLatestTransaction(type) {
      let temp = transactions.filter(item => item['type'].includes(type))
      return temp[temp.length - 1] || undefined
    };
  }

  console.log('done testing')

  async function loadSheet() {
    let authState = true
    await doc.useServiceAccountAuth(creds)
      .catch(e => {
        console.log(e.message)
        authState = false
      })
    if (!authState) {
      await sleep(5000)
      await loadSheet()
      return
    }
    await doc.loadInfo()
      .catch(async e => {
        console.log(e.message)
        await sleep(5000)
        await loadSheet()
      })
    sheet = doc.sheetsByIndex[2];
  }

  await loadSheet()

  for (var t in storageObject) {
    let rule = t
    delete storageObject[t]['ruleIndicator']
    let transactions = storageObject[t]['transactions']
    let latestTransaction = transactions[transactions.length - 1]

    let exits = transactions.filter(item => item['profit'])
    let entries = transactions.filter(item => item['type'].includes('Entry'))
    let shorts = transactions.filter(item => item['type'] === 'Short Exit')
    let longs = transactions.filter(item => item['type'] === 'Long Exit')

    async function avgDailyProfit() {
      if (exits.length < 1) return 0
      let sum = 0
      let length = 0
      for (var c = 0; c < 5000; c++) {
        let daily = 1
        let start = new Date(exits[0]['time'])
        if (c !== 0) start.setHours(start.getHours() + 24 * c)
        let end = new Date(start.getTime())
        end.setHours(end.getHours() + 24)
        let filtered = exits.filter(item => item['time'] >= start.getTime() && item['time'] <= end.getTime())
        if (filtered.length === 0) break
        filtered.forEach(item => {
          daily = daily * (1 + item['leverageProfit'] / 100)
        })
        //console.log('daily profit', daily)
        sum = sum + daily
        length++
      }
      return sum / length
    }

    let testIndicators = entries.length >= 1 ? entries[0]['testIndicators'] : undefined

    let result = {
      profit: 1,
      leverageProfit: 1,
      testProfit: 1,
      transactions: transactions.length,
      ratio: exits.filter(item => item['profit'] >= 0).length / exits.length,
      ratioShorts: shorts.filter(item => item['profit'] >= 0).length / shorts.length,
      ratioLongs: longs.filter(item => item['profit'] >= 0).length / longs.length,
      leverage: leverage,
      factor: factor,
      avgDailyProfit: await avgDailyProfit(),
      testIndicators: {},
      end_time: new Date(endTime).toString(),
      'profit 3h': 1
    }

    async function returnTestIndicatorsRatio(indicator) {
      let ratio = 0
      let ratio2 = 0
      for (var p = 1; p < transactions.length; p = p + 2) {
        let entry = transactions[p - 1]
        let exit = transactions[p]

        if (exit['profit'] >= 0 && entry['testIndicators'][indicator] === true) {
          ratio++
        } else if (exit['profit'] <= 0 && entry['testIndicators'][indicator] === false) {
          ratio2++
        }
      }

      return {
        wins: parseFloat(Number(ratio / (entries.length - 1)).toFixed(3)),
        losses: parseFloat(Number(ratio2 / (entries.length - 1)).toFixed(3))
      }
    }
    if (testIndicators) {
      for (var g in testIndicators) {
        result['testIndicators'][g] = {
          ratio: await returnTestIndicatorsRatio(g)
        }
      }
    }

    let profitArray = []
    let splitTime = new Date(endTime)
    splitTime.setHours(splitTime.getHours() - timeframe / 2)

    let oneHour = new Date(endTime)
    oneHour.setHours(oneHour.getHours() - 1)
    //calculate profits
    let holdTimes = []
    let holdTimesFast = []
    let holdTimesOld = []
    let oneHourTimes = []
    exits.forEach(item => {
      if (item['profit'] === 0) throw 'profit error'
      result['profit'] = Number(result['profit'] * (1 + item['profit'] / 100)).toFixed(5)
      result['leverageProfit'] = Number(result['leverageProfit'] * (1 + item['leverageProfit'] / 100)).toFixed(5)
      //console.log('profit Array push', result['leverageProfit'])
      profitArray.push(result['leverageProfit'])
      result['testProfit'] = Number(result['testProfit'] * (1 + (item['profit'] * 8) / 100)).toFixed(5)
      holdTimes.push(parseFloat(item['holdLength']))

      if (item['time'] >= splitTime.getTime()) {
        result['profit 3h'] = Number(result['profit 3h'] * (1 + item['leverageProfit'] / 100)).toFixed(5)
        holdTimesFast.push(parseFloat(item['holdLength']))
      } else {
        holdTimesOld.push(parseFloat(item['holdLength']))
      }

      if (item['time'] >= oneHour.getTime()) oneHourTimes.push(parseFloat(item['holdLength']))
      //console.log((1 + item['leverageProfit'] / 100), result['leverageProfit'])
    })

    let avgHoldTime = holdTimes.reduce(function (a, b) {
      return a + b;
    }, 0) / holdTimes.length

    let avgHoldTimeFast = holdTimesFast.reduce(function (a, b) {
      return a + b;
    }, 0) / holdTimesFast.length

    let avgHoldTimeOld = holdTimesOld.reduce(function (a, b) {
      return a + b;
    }, 0) / holdTimesOld.length

    let oneHourTime = oneHourTimes.reduce(function (a, b) {
      return a + b;
    }, 0) / oneHourTimes.length

    result['Ratio 3h'] = exits.filter(item => item['profit'] >= 0 && item['time'] >= splitTime.getTime()).length / exits.filter(item => item['time'] >= splitTime.getTime()).length,

      result['highest profit'] = Number((Math.max(...profitArray) - 1) * 100).toFixed(3)
    result['lowest profit'] = Number((Math.min(...profitArray) - 1) * 100).toFixed(3)
    result["profit ratio"] = result['leverageProfit'] / result['profit']

    result['leverageProfit'] = Number((result['leverageProfit'] - 1) * 100).toFixed(3) + '%'
    result['profit'] = Number((result['profit'] - 1) * 100).toFixed(3) + '%'
    result['testProfit'] = Number((result['testProfit'] - 1) * 100).toFixed(3) + '%'
    result['profit 3h'] = Number((result['profit 3h'] - 1) * 100).toFixed(3) + '%'

    result['Ratio 1h'] = exits.filter(item => item['profit'] >= 0 && item['time'] >= oneHour.getTime()).length / exits.filter(item => item['time'] >= oneHour.getTime()).length,

      console.log(rule, result['avgDailyProfit'])

    let filteredHistory = history.filter(item => item['time'] >= splitTime.getTime()).map(item => +item['price'])

    let rowObject = {
      Rule: rule,
      Pair: symbol,
      'Start Date': customDate.toString(),
      'End Date': result['end_time'],
      Timeframe: timeframe,
      Profit: result['profit'].replace('.', ','),
      'Leverage Profit': result['leverageProfit'].replace('.', ','),
      'Ratio': result['ratio'],
      High: result['highest profit'].replace('.', ',') + '%',
      Low: result['lowest profit'].replace('.', ',') + '%',
      Transactions: result['transactions'],
      Leverage: result['leverage'],
      "Ratio Shorts": result['ratioShorts'],
      "Ratio Longs": result['ratioLongs'],
      Reversal: result['ratioShorts'] && result['ratioLongs'] ? 'true' : 'false',
      //'Avg Daily Profit': Number(result['avgDailyProfit']).toFixed(3).replace('.', ',') + '%',
      Timestamp: new Date().toLocaleTimeString(),
      'Profit 3h': result['profit 3h'].replace('.', ','),
      'Ratio 3h': result['Ratio 3h'],
      'Ratio 1h': result['Ratio 1h'],
      'Hold Time 3h': avgHoldTimeFast,
      'Hold Time': avgHoldTime,
      'Hold Time Old': avgHoldTimeOld,
      'Volume Index': volumeIndex,
      'Transactions 3h': transactions.filter(item => item['time'] >= splitTime.getTime()).length,
      'Transactions 1h': transactions.filter(item => item['time'] >= oneHour.getTime()).length,
      'Test Profit': result['testProfit'].replace('.', ','),
      'Platform': 'BINANCE',
      'Time': new Date().getTime(),
      'Trx diff': latestTransaction ? (latestTransaction['time'] - new Date(endTime).getTime()) / 1000 / 60 * -1 : null,
      'Hold Time 1h': oneHourTime,
      'Price High': Math.max(...filteredHistory),
      'Price Low': Math.min(...filteredHistory)
      //'Type': 'Test'
    }

    rowObject['Volatility'] = rowObject['Price High'] / rowObject['Price Low']

    async function uploadData() {
      let rows = await sheet.getRows()
        .catch(e => {
          console.log('error get rows', e.message)
          return undefined
        })
      if (!rows) {
        await sleep(2500)
        await uploadData()
        return
      }
      let array = []
      for (var a in rows) {
        array.push({
          symbol: rows[a]['Pair'],
          rule: rows[a]['Rule']
        })
      }
      let index = array.findIndex(item => item['rule'] === rule && item['symbol'] === symbol)
      let filteredRows = array.filter(item => item['rule'] === rule && item['symbol'] === symbol)
      if (filteredRows.length >= 2) webhook.send(`${symbol} with ${rule} is multiple times in table!`)
      if (index < 0) {
        await sheet.addRow(rowObject)
          .catch(async e => {
            console.log('error', e.message)
            await sleep(5000)
            await uploadData()
          })
      } else {
        for (var c in rowObject) {
          rows[index][c] = rowObject[c]
        }
        await rows[index].save()
          .catch(async e => {
            console.log('error save row', e.message)
            await sleep(5000)
            await uploadData()
          })
      }
    }

    if (transactions.length >= 2) {
      //TODO send data via fetch to socket and push into 24h profit

      console.log('start upload data for', rule)
      await uploadData()
        .catch(async e => {
          console.log('upload data error', e.message)
          webhook.send('upload data error ' + e.message)
            .catch(e => {
              console.log(e.message)
            })
        })

      continue
      await fetch(`http://boehler-trading.com/ruletesting`, {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({
          symbol: symbol,
          rule: rule,
          profit: result['leverageProfit'],
          ratio: result['ratio'],
          ratioLong: result['ratioLongs'],
          ratioShort: result['ratioShorts']
        }),
        //redirect: 'follow'
      })
    } else {
      rowObject['Profit'] = '0,0%'
      rowObject['Leverage Profit'] = '0,0%'
      rowObject['High'] = '0,0%'
      rowObject['Low'] = '0,0%'
      rowObject['Avg Daily Profit'] = '0,0%'
      rowObject['Profit 3h'] = '0,0%'
      rowObject['Ratio'] = 0
      rowObject['Ratio 3h'] = 0
      rowObject['Transactions'] = 0
      rowObject['Ratio 1h'] = 0
      rowObject['Hold Time 3h'] = 0
      console.log(symbol, rule, 'no transactions')

      console.log('start upload data for', rule)
      await uploadData()
        .catch(async e => {
          console.log('upload data error', e.message)
          webhook.send('upload data error ' + e.message)
            .catch(e => {
              console.log(e.message)
            })
        })
    }
  }

  //console.log(exits.sort(function(a, b){return b['leverageProfit']-a['leverageProfit']}))

  //console.log('profit in prozent')
  //console.log(result)
}


async function filterByTime(timestamp, array) {
  //console.log('time',array[0]['time'], array.length)
  let temp = array.filter(item => Number(item['time']) <= timestamp)
  //console.log('temp', temp.length)
  let data = temp[temp.length - 1]
  let lineDirection = await lineDirectionGen(temp.map(item => item['eight']))
  data['lineDirection'] = lineDirection
  return data
}

async function lineDirectionGen(arr) {
  arr = arr.slice(Math.max(arr.length - 11, 0))
  let sum = 1
  for (var a = 1; a < arr.length; a++) {
    //console.log(arr[a] / arr[a - 1])
    sum = sum * (arr[a] / arr[a - 1])
  }
  //console.log('sum', sum)
  return sum // arr.length
}

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}
