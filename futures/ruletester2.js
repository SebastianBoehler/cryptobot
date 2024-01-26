var fs = require('fs');
const fileUtils = require('../fileUtils');
const fetch = require('node-fetch');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
var {
  generateIndicators
} = require('./indicators');

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'RbylZBGeoAys1HIPRYAnhDjvyyq6yow4viq5bewd8MqJ2gzmb0YGQM6G',
  APISECRET: 'RbylZBGeoAys1HIPRYAnhDjvyyq6yow4viq5bJT7wd8MqJ2gzmb0YGQM6G'
});
let port = Math.floor(1000 + Math.random() * 9000)
let factor = 5

const {
  GoogleSpreadsheet
} = require('google-spreadsheet');

const creds = require('./google-credentials.json'); // the file saved above
const doc = new GoogleSpreadsheet('11uXOxpfZieOf5p27KqmuSl5drcyztssS3SNtA7YGUTE');

var express = require("express");
const bodyParser = require('body-parser');
var server = express();
server.use(bodyParser.json());
server.use(express.static(__dirname));

const Discord = require("discord.js");
//https://discord.com/api/webhooks/832997472736641105/XWlsXwD4NSsuVJJzlCeRZvISgsYzzrEac85JxbgiN0lXcr5jY0tccNRlhErCEGJezNpX
const webhook = new Discord.WebhookClient('832997472736641105', 'XWlsXwD4NCeRZvISgsYzzrEac85JxbgiN0lXcr5jY0tccNRlhErCEGJezNpX');

const crypto = require('crypto');

server.get('/', async (req, res) => {
  //console.log('requested site')
  let symbol = req.query['symbol']
  //let history = require(`./data/${symbol}`)
  let granularity = parseFloat(req.query['granularity']) || 15

  if (!req.query['split']) {
    let db = await fileUtils.loadData(symbol, 'BINANCE')
      .catch(e => {
        console.error(e)
        return undefined
      })
    let {
      array: history
    } = await generateIndicators(symbol, granularity, db, true, factor)
    res.redirect(`/?symbol=${symbol}&split=${Number(history.length / 3).toFixed(0)}&granularity=${granularity}`)
  } else res.sendFile(__dirname + '/chart.html')
})

server.get('/indicators', async (req, res) => {
  let symbol = req.query['symbol']
  let granularity = parseFloat(req.query['granularity'])
  let {
    array
  } = await generateIndicators(symbol, granularity, require(`./data/${symbol}.json`), true, factor)

  res.send(array)
})

server.listen(port, async () => {
  console.log("Server running on port " + port)
  main()
})

let endTime = new Date('Mon Jun 28 2021 23:34:42 GMT+0000 (Coordinated Universal Time)').getTime()
let timeframe = 15
let customDate = new Date('Sun Jun 13 2021 16:57:34 GMT+0000 (Coordinated Universal Time)')
//customDate.setDate(customDate.getDate() - timeframe)

async function main() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  let fullData = {}
  let products = await binance.futuresPrices()

  let tempArray = []

  for (var f in products) {
    tempArray.push(f)
  }

  let index = 0
  for (var a = index; a < tempArray.length; a++) {
    let symbol = tempArray[a]
    if (symbol !== 'MATICUSDT' && symbol !== 'SUSHIUSDT' && symbol !== 'LINKUSDT' && symbol !== 'ADAUSDT' && symbol !== 'UNIUSDT' && symbol !== 'EOSUSDT' && symbol !== 'IPCUSDT' && symbol !== 'THETAUSDT' && symbol !== 'VETUSDT' && symbol !== 'LRCUSDT' && symbol !== 'FILUSDT' && symbol !== 'BTCUSDT') continue
    let rules = [
      //'origin',
      //'origin_#2',
      //'test',
      //'test2',
      //'test3',
      //'test4',
      //'test4_#2',
      //'test5',
      //'test6'
      //'test7',
      //'test8',
      //'test9',
      //'test10'
      //'test11',
      //'test12',
      //'test13',
      //'test14'
      //'test16',
      //'test17',
      //'test18',
      //'test19',
      //'test20',
      //'test20_#2'
      //'test21',
      //'test22',
      'test23',
      'test24',
      'test25'
    ]
    for (var t in rules) {
      let result = await tester(symbol, rules[t])
      fullData[a] = result
      console.log(JSON.stringify(fullData, null, 3))
      result['port'] = port
      result['end_time'] = new Date(endTime).toString()

      await webhook.send(`${symbol} with rule ${rules[t]}` + '\n```JSON\n' + JSON.stringify(result, null, 3) + '```')
      await webhook.send({
        files: [
          new Discord.MessageAttachment(result['path'], `${symbol}_transactions.json`)
        ]
      })

      let rowObject = { Rule: rules[t], Pair: symbol, 'Start Date': customDate.toString(), 'End Date': result['end_time'], Timeframe: timeframe, Profit: result['profit'].replace('.', ','), 'Leverage Profit': result['leverageProfit'].replace('.', ','), 'Ratio': result['ratio'], High: result['highest profit'].replace('.', ',') + '%', Low: result['lowest profit'].replace('.', ',') + '%', Transactions: result['transactions'], Leverage: result['leverage'], "Ratio Shorts": result['ratioShorts'], "Ratio Longs": result['ratioLongs'], Reversal: result['ratioShorts'] && result['ratioLongs'] }
      await sheet.addRow(rowObject);
    }
  }
  fs.writeFileSync('./fullData.json', JSON.stringify(fullData, null, 3), {
    encoding: 'utf-8'
  })

  main()
}

async function tester(symbol, ruleIndex) {
  console.log('load data for', symbol)
  let history = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
    .catch(e => {
      console.error(e)
      return undefined
    })
  if (!history) return

  history.forEach((item, a) => {
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
  //console.log(symbol + 'PERP', history)
  //console.log(crypto.createHash('sha256').update(JSON.stringify(history[20000])).digest('hex'))

  //console.log('90 min indicators length', Data90min.length)

  if (!fs.existsSync('./data')) fs.mkdirSync('./data')
  fs.writeFileSync(`./data/${symbol}PERP.json`, JSON.stringify(history), {
    encoding: 'utf-8'
  })
  console.log('wrote to', `./data/${symbol}PERP.json`)

  let transactions = []

  let ruleIndicator = {
    "Long Entry": 0,
    "Long Exit": 0,
    "Short Entry": 0,
    "Short Exit": 0
  }

  let leverage = 5

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
    console.log(`${a}/${history.length} | ${transactions.length} | ${new Date(timestamp).toLocaleString()}`)
    //await sleep(1000 * 1)
    if (a % 150 == 0) {
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

    //if (transactions.length >= 4) break

    //console.log('array length', history.length, history[0]['id'])
    //console.log(crypto.createHash('sha256').update(JSON.stringify(array.map(item => item['close']))).digest('hex'))
    let Indicators1min = await generateIndicators(1, symbol + 'PERP', factor - 3, a)
    let Indicators5min = await generateIndicators(5, symbol + 'PERP', factor - 4, a)
    //console.log(crypto.createHash('sha256').update(JSON.stringify(array.map(item => item['close']))).digest('hex'))
    let Indicators15min = await generateIndicators(15, symbol + 'PERP', factor, a)

    let Indicators60min = await generateIndicators(60, symbol + 'PERP', factor, a - 2)
    //console.log(crypto.createHash('sha256').update(JSON.stringify(array.map(item => item['close']))).digest('hex'))
    //console.log('15', Indicators15min['WilliamsR_EMA'], Indicators15min['WilliamsR'])
    console.log('port', port)

    let Indicators90min = await generateIndicators(90, symbol + 'PERP', factor - 2, a)

    if (!Indicators1min || !Indicators5min || !Indicators15min || !Indicators90min) {
      a--
      continue
    }

    //console.log(Indicators90min)
    //if (transactions.length >= 2) break

    let testTimeframe = new Date()
    testTimeframe.setHours(testTimeframe.getHours() - 48)
    testTimeframe = testTimeframe.getTime()

    let lastJump = undefined

    let profit = await calculateProfit(price)

    //if (a >= Data1min.length - 10) console.log(Indicators15min['eight'], Indicators15min['fiftyfive'], new Date(Number(Indicators15min['time'])).toLocaleString(), new Date(Number(Data1min[a]['time'])).toLocaleString(), Indicators15min['eight'] >= Indicators15min['fiftyfive'])

    let latestEntry = await getLatestTransaction('Entry')
    let latestExit = await getLatestTransaction('Exit')

    //console.log('latest Exit', latestExit)

    let number = 1
    let exits = transactions.filter(item => item['type'].includes('Exit'))

    for (var g in exits) {
      let profit = parseFloat(exits[g]['leverageProfit'])
      number = number * (1 + profit / 100)
    }

    console.log('general Profit', number)

    let lastTwo = transactions.slice(Math.max(transactions.length - 3, 0)).filter(item => item['details'][1] === 'stop loss')
    //console.log('lastTwo', lastTwo.length)
    lastTwo = lastTwo.length

    //if (lastTwo === 2) leverage = 10
    //console.log(Indicators15min)
    //if (transactions.length >= 4) break
    //console.log('abs', Math.abs(Indicators15min['eight'] - Indicators15min['thirteen']) / price)

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
    }

    //test 8
    //testing: test4 / test2
    if (ruleIndex === 'test4') {
      rule = {
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
      }
    } else if (ruleIndex === 'test2') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['RSI_EMA'] >= Indicators5min['RSI_EMA_prev'],
            Indicators5min['RSI'] >= Indicators5min['RSI_EMA'],
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
            Indicators5min['RSI'] <= Indicators5min['RSI_EMA'],
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
      }
    } else if (ruleIndex === 'test') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['fast_RSI_prev'] <= Indicators5min['slow_RSI_prev'],
            Indicators5min['fast_RSI'] >= Indicators5min['slow_RSI'],
            Indicators15min['fast_RSI'] >= Indicators15min['slow_RSI'],
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
            Indicators5min['fast_RSI_prev'] >= Indicators5min['slow_RSI_prev'],
            Indicators5min['fast_RSI'] <= Indicators5min['slow_RSI'],
            Indicators15min['fast_RSI'] <= Indicators15min['slow_RSI'],
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
      }
    } else if (ruleIndex === 'test3') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['fast_RSI_prev'] <= Indicators5min['slow_RSI_prev'],
            Indicators5min['fast_RSI'] >= Indicators5min['slow_RSI'],
            Indicators15min['fast_RSI_prev'] <= Indicators15min['slow_RSI_prev'],
            Indicators15min['fast_RSI'] >= Indicators15min['slow_RSI'],
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
            Indicators5min['fast_RSI_prev'] >= Indicators5min['slow_RSI_prev'],
            Indicators5min['fast_RSI'] <= Indicators5min['slow_RSI'],
            Indicators15min['fast_RSI_prev'] >= Indicators15min['slow_RSI_prev'],
            Indicators15min['fast_RSI'] <= Indicators15min['slow_RSI'],
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
      }
    } else if (ruleIndex === 'test5') {
      rule = {
        "Long Entry": [
          [
            Indicators15min['fast_RSI'] >= Indicators15min['slow_RSI'],
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
          ],
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['fast_RSI_prev'] <= Indicators5min['slow_RSI_prev'],
            Indicators5min['fast_RSI'] >= Indicators5min['slow_RSI'],
            //Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            //Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
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
            Indicators15min['fast_RSI'] <= Indicators15min['slow_RSI'],
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
          ],
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['fast_RSI_prev'] >= Indicators5min['slow_RSI_prev'],
            Indicators5min['fast_RSI'] <= Indicators5min['slow_RSI'],
            //Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            //Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
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
      }
    } else if (ruleIndex === 'test6') {
      rule = {
        "Long Entry": [
          [
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
          ],
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI_prev'] <= Indicators5min['RSI_EMA_prev'],
            Indicators5min['RSI'] >= Indicators5min['RSI_EMA'],
            //Indicators90min['eight'] >= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'down'),
            //Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
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
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
          ],
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] <= Indicators5min['twentyone'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI_prev'] >= Indicators5min['RSI_EMA_prev'],
            Indicators5min['RSI'] <= Indicators5min['RSI_EMA'],
            //Indicators90min['eight'] <= Indicators90min['twentyone'],
            //!(Indicators5min['volatility']['latest'] >= Indicators5min['volatility']['avg'] && Indicators5min['volatility']['direction'] === 'up'),
            //Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
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
      }
    } else if (ruleIndex === 'test7') {
      //test2
      let rule1 = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['fast_RSI'] >= Indicators5min['slow_RSI'],
            Indicators15min['fast_RSI'] >= Indicators15min['slow_RSI'],
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
            Indicators5min['fast_RSI'] <= Indicators5min['slow_RSI'],
            Indicators15min['fast_RSI'] <= Indicators15min['slow_RSI'],
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
      }
      //origin
      let rule2 = {
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
      }

      rule = Math.abs(Indicators90min['eight'] / Indicators90min['fiftyfive'] - 1) >= 0.01 ? rule2 : rule1
    } else if (ruleIndex === 'test8') {
      rule = {
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
      }
    } else if (ruleIndex === 'test9') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators60min['RSI'] >= Indicators60min['RSI_EMA'],
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
            Indicators60min['RSI'] <= Indicators60min['RSI_EMA'],
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
      }
    } else if (ruleIndex === 'test10') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            //Indicators90min['eight'] >= Indicators90min['twentyone'],
            Indicators60min['RSI'] >= Indicators60min['RSI_EMA'],
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
            //Indicators90min['eight'] <= Indicators90min['twentyone'],
            Indicators60min['RSI'] <= Indicators60min['RSI_EMA'],
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
      }
    } else if (ruleIndex === 'test11') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            //!latestExit || latestExit['details'][0] >= Indicators5min['thirteen'] * 1.01 || latestExit['details'][0] <= Indicators5min['thirteen'] * 0.99,
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
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
            //!latestExit || latestExit['details'][0] >= Indicators5min['thirteen'] * 1.01 || latestExit['details'][0] <= Indicators5min['thirteen'] * 0.99,
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
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
          Indicators5min['thirteen'],
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      }
    } else if (ruleIndex === 'test12') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            !latestExit || latestExit['details'][0] * 1.01 < Indicators5min['thirteen'] || latestExit['details'][0] * 0.99 > Indicators5min['thirteen'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators15min['RSI'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'],
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
            !latestExit || latestExit['details'][0] * 1.01 < Indicators5min['thirteen'] || latestExit['details'][0] * 0.99 > Indicators5min['thirteen'],
            Indicators1min['RSI'] >= 35,
            Indicators5min['RSI'] >= 35,
            Indicators15min['RSI'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'],
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
          Indicators5min['thirteen'],
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      }
    } else if (ruleIndex === 'test13') {
      rule = {
        "Long Entry": [
          [
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            Indicators15min['RSI_prev'] <= Indicators15min['RSI_EMA_prev']
          ],
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators5min['RSI'] >= Indicators5min['RSI_EMA'],
            Indicators5min['RSI_prev'] <= Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI'] >= Indicators15min['RSI_EMA'],
            Indicators5min['RSI_EMA_prev'] <= Indicators5min['RSI_EMA'],
            //Indicators5min['RSI_UP'],
            Indicators1min['RSI'] >= Indicators1min['RSI_prev'],
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Long Exit": [
          [
            Indicators5min['RSI_EMA_prev'] >= Indicators5min['RSI_EMA'],//|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        "Short Entry": [
          [
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            Indicators15min['RSI_prev'] >= Indicators15min['RSI_EMA_prev']
          ],
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators5min['RSI'] <= Indicators5min['RSI_EMA'],
            Indicators5min['RSI_prev'] >= Indicators5min['RSI_EMA_prev'],
            Indicators15min['RSI'] <= Indicators15min['RSI_EMA'],
            Indicators5min['RSI_EMA_prev'] >= Indicators5min['RSI_EMA'],
            //Indicators5min['RSI_UP'],
            Indicators1min['RSI'] <= Indicators1min['RSI_prev'],
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.0005
          ]
        ],
        "Short Exit": [
          [
            Indicators5min['RSI_EMA_prev'] <= Indicators5min['RSI_EMA'] //|| profit >= 0.49 || profit <= -0.99
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      }
    } else if (ruleIndex === 'test14') {
      rule = {
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
      }
    } else if (ruleIndex === 'test15') {
      rule = {
        "Long Entry": [
          [
            //!lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //Indicators5min['eight'] >= Indicators5min['twentyone'],
            Indicators1min['RSI'] <= 65,
            Indicators5min['RSI'] <= 65,
            Indicators5min['RSI_EMA'] >= Indicators5min['RS_EMA_prev'],
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
            Indicators5min['RSI_EMA'] <= Indicators5min['RS_EMA_prev'], ,
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
      }
    }

    if (ruleIndex === 'test16') {
      rule = {
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
      }
    } else if (ruleIndex === 'test17') {
      rule = {
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
      }
    } else if (ruleIndex === 'test18') {
      rule = {
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
      }
    } else if (ruleIndex === 'test19') {
      rule = {
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
      }
    } else if (ruleIndex === 'test20') {
      rule = {
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
      }
    } else if (ruleIndex === 'test21') {
      rule = {
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
      }
    } else if (ruleIndex === 'test22') {
      rule = {
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
      }
    } else if (ruleIndex === 'test4_#2') {
      rule = {
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
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99 || Indicators5min['RSI_EMA'] <= Indicators5min['RSI_EMA_prev']
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
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99 || Indicators5min['RSI_EMA'] >= Indicators5min['RSI_EMA_prev']
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      }
    } else if (ruleIndex === 'origin_#2') {
      rule = {
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
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99 || Indicators5min['RSI'] >= 65,
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
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99 || Indicators5min['RSI'] <= 35,
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      }
    } else if (ruleIndex === 'test20_#2') {
      rule = {
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
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99 || Indicators15min['WilliamsR'] <= Indicators15min['WilliamsR_EMA']
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
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.49 || profit <= -0.99 || Indicators15min['WilliamsR'] >= Indicators15min['WilliamsR_EMA']
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
        ]
      }
    }

    if (ruleIndex === 'test23') {
      rule = {
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
      }
    } else if (ruleIndex === 'test24') {
      rule = {
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
      }
    } else if (ruleIndex === 'test25') {
      rule = {
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
      }
    }
    //console.log('rule Indicator',ruleIndicator)

    for (var b in ruleIndicator) {
      //if (b.includes('Entry')) console.log(b, rule[b], ruleIndicator)
      //console.log(b, rule[b], ruleIndicator)
      if ((rule[b][ruleIndicator[b]].filter(item => item === true)).length === rule[b][ruleIndicator[b]].length) {
        ruleIndicator[b]++
      }
    }

    //console.log(rule)

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
    }

    async function returnTestIndicators(type) {
      let test = {}
      for (var t in testIndicators) {
        test[t] = testIndicators[t][type]
      }
      return test
    }

    if (transactions.length !== 0 && transactions[transactions.length - 1]['type'].includes('Entry')) {
      console.log('profit', profit)
      //exit order next
      ruleIndicator['Long Entry'] = 0
      ruleIndicator['Short Entry'] = 0

      let latestTransaction = transactions[transactions.length - 1]

      let timeDifference = (Number(history[a]['time']) - Number(history[a - 1]['time'])) / 1000 / 60
      if (timeDifference >= 5) {
        lastJump = Number(history[a]['time'])
        console.error('database jump', new Date(timestamp).toLocaleString())
        transactions.slice(-1, 1)
        indicatorCountReset()
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
        ruleIndicator['Long Exit'] = 0
        if (ruleIndicator['Short Exit'] === rule['Short Exit'].length) {
          console.log(obj['generalProfit'], new Date(timestamp).toLocaleString(), 'Short Exit')
          //console.log('Short exit', new Date(timestamp).toLocaleTimeString())
          obj['type'] = 'Short Exit'
          obj['action'] = obj['type']
          obj['profit'] = obj['profit'] * 0.999
          obj['leverageProfit'] = obj['profit'] * leverage
          obj['testIndicators'] = await returnTestIndicators('short')
          //if (rule['details'][1] === 'stop loss') console.log('stop loss', obj['type'], rule['details'][2])
          transactions.push(obj)
          indicatorCountReset()
        }
      } else {
        //Long exit
        //console.log(obj['generalProfit'])
        ruleIndicator['Short Exit'] = 0
        if (ruleIndicator['Long Exit'] === rule['Long Exit'].length) {
          console.log(obj['generalProfit'], new Date(timestamp).toLocaleString(), 'Long Exit')
          //console.log('long Exit', new Date(timestamp).toLocaleTimeString())
          obj['type'] = 'Long Exit'
          obj['action'] = obj['type']
          obj['profit'] = obj['profit'] * 0.999
          obj['leverageProfit'] = obj['profit'] * leverage
          obj['testIndicators'] = await returnTestIndicators('long')
          //if (rule['details'][1] === 'stop loss') console.log('stop loss', obj['type'], rule['details'][2])
          transactions.push(obj)
          indicatorCountReset()
        }
      }

      if (profit < -0.5 && !latestTransaction['reversal'] && ruleIndex === 'reversal') {
        obj['type'] = latestTransaction['type'].includes('Short') ? 'Short Exit' : 'Long Exit'
        obj['action'] = obj['type']
        transactions.push(obj)

        transactions.push({
          price: price,
          time: timestamp,
          timestamp: new Date(timestamp).toLocaleString(),
          type: latestTransaction['type'].includes('Short') ? 'Long Entry' : 'Short Entry',
          action: latestTransaction['type'].includes('Short') ? 'Long Entry' : 'Short Entry',
          details: rule['details'],
          reversal: true
        })
        indicatorCountReset()
      }

    } else {
      //entry order next
      ruleIndicator['Long Exit'] = 0
      ruleIndicator['Short Exit'] = 0
      //console.log('entry next')

      let obj = {
        price: price,
        time: timestamp,
        timestamp: new Date(timestamp).toLocaleString(),
        type: null,
        details: rule['details'],
        testIndicators: null
      }

      //long
      if (ruleIndicator['Long Entry'] === rule['Long Entry'].length) {
        console.log('long entry', new Date(timestamp).toLocaleTimeString())
        obj['type'] = 'Long Entry'
        obj['action'] = obj['type']
        obj['testIndicators'] = await returnTestIndicators('long')
        transactions.push(obj)
        indicatorCountReset()
      } else if (ruleIndicator['Short Entry'] === rule['Short Entry'].length) {
        console.log('short entry', new Date(timestamp).toLocaleTimeString())
        obj['type'] = 'Short Entry'
        obj['action'] = obj['type']
        obj['testIndicators'] = await returnTestIndicators('short')
        transactions.push(obj)
        indicatorCountReset()
      }
    }

    async function calculateProfit(price) {
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
    }

    async function indicatorCountReset() {
      ruleIndicator = {
        "Long Entry": 0,
        "Long Exit": 0,
        "Short Entry": 0,
        "Short Exit": 0
      }
    }

    async function getLatestTransaction(type) {
      let temp = transactions.filter(item => item['type'].includes(type))
      return temp[temp.length - 1] || undefined
    }
  }

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
    testIndicators: {}
  }

  //testIndicators start
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
  //testIndicators end

  let string = ''

  let profitArray = []

  exits.forEach(item => {
    if (item['profit'] === 0) throw 'profit error'
    result['profit'] = Number(result['profit'] * (1 + item['profit'] / 100)).toFixed(5)
    result['leverageProfit'] = Number(result['leverageProfit'] * (1 + item['leverageProfit'] / 100)).toFixed(5)
    //console.log('profit Array push', result['leverageProfit'])
    profitArray.push(result['leverageProfit'])
    result['testProfit'] = Number(result['testProfit'] * (1 + (item['profit'] * 8) / 100)).toFixed(5)
    //console.log((1 + item['leverageProfit'] / 100), result['leverageProfit'])
  })

  console.log('profit array', profitArray)

  result['highest profit'] = Number((Math.max(...profitArray) - 1) * 100).toFixed(3)
  result['lowest profit'] = Number((Math.min(...profitArray) - 1) * 100).toFixed(3)
  result["profit ratio"] = result['leverageProfit'] / result['profit']

  for (var f = 0; f < transactions.length; f = f + 2) {
    let entry = transactions[f]
    let exit = transactions[f + 1]

    if (!exit) continue

    let difference = (entry['time'] - exit['time']) / 1000 * -1

    let orderType = entry['type'].includes('Short') ? '-1' : '+1'
    let orderTypeEntry = entry['type'] === 'Short Entry' ? 'SE' : entry['type'] === 'Short Exit' ? 'SX' : entry['type'] === 'Long Entry' ? 'LE' : entry['type'] === 'Long Exit' ? 'LX' : ''
    let orderTypeExit = exit['type'] === 'Short Entry' ? 'SE' : exit['type'] === 'Short Exit' ? 'SX' : exit['type'] === 'Long Entry' ? 'LE' : exit['type'] === 'Long Exit' ? 'LX' : ''
    let details = exit['details'].slice(2, 7)
    string += `${orderType};${orderTypeEntry};${entry['price']};${orderTypeExit};${exit['timestamp']};${exit['price']};${exit['profit']};${Number(exit['leverageProfit']).toFixed(2)};${difference};${Number(difference / 60).toFixed(0)}m;${exit['details'][1]};${details.join(';')}\n`
  }

  fs.writeFileSync('./string.txt', string, {
    encoding: 'utf-8'
  })

  fs.writeFileSync('./string_formatted.txt', replaceAll(string, '.', ','), {
    encoding: 'utf-8'
  })

  //console.log(exits.sort(function(a, b){return b['leverageProfit']-a['leverageProfit']}))

  //console.log('profit in prozent')
  result['leverageProfit'] = Number((result['leverageProfit'] - 1) * 100).toFixed(3) + '%'
  result['profit'] = Number((result['profit'] - 1) * 100).toFixed(3) + '%'
  result['testProfit'] = Number((result['testProfit'] - 1) * 100).toFixed(3) + '%'
  //console.log(result)

  fs.writeFileSync(`./data/${symbol}PERP_transactions.json`, JSON.stringify(transactions, null, 3), {
    encoding: 'utf-8'
  })
  result['path'] = `./data/${symbol}PERP_transactions.json`
  return result
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
