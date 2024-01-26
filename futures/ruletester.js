var fs = require('fs');
const fileUtils = require('../fileUtils');
const fetch = require('node-fetch');
var {
  generateIndicators
} = require('../indicators');

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'RbylZBGeoAys1HIPRYAnhDjq5be3mWD5JT7wd8MqJ2gzmb0YGQM6G',
  APISECRET: 'RbylZBGeoAys1HIPRYAnhDjvyyq5be3mWD5JT7wd8MqJ2gzmb0YGQM6G'
});
let port = 8080
let factor = 5

var express = require("express");
const bodyParser = require('body-parser');
var server = express();
server.use(bodyParser.json());
server.use(express.static(__dirname));

const crypto = require('crypto')

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

async function main() {
  let fullData = {}
  let products = await binance.futuresPrices()
  for (var a in products) {
    if (a !== 'BTCUSDT' && a !== 'ETHUSDT' && a !== 'LINKUSDT' && a !== 'THETAUSDT') continue
    let symbol = a
    let result = await tester(symbol)
    fullData[a] = result
    console.log(JSON.stringify(fullData, null, 3))
  }
  fs.writeFileSync('./fullData.json', JSON.stringify(fullData, null, 3), {
    encoding: 'utf-8'
  })
}

async function tester(symbol) {
  console.log('load data for', symbol)
  let history = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
    .catch(e => {
      console.error(e)
      return undefined
    })
  if (!history) return
  console.log('loaded')

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
  let {
    array: Data1min
  } = await generateIndicators('EMA', 1, history, true, factor - 4)

  history = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
    .catch(e => {
      console.error(e)
      return undefined
    })
  console.log('loaded')

  let {
    array: Data5min
  } = await generateIndicators('EMA', 5, history, true, factor)

  history = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
    .catch(e => {
      console.error(e)
      return undefined
    })
  console.log('loaded')

  let {
    array: Data15min
  } = await generateIndicators('EMA', 15, history, true, factor)

  history = await fileUtils.loadData(symbol + 'PERP', 'BINANCE')
    .catch(e => {
      console.error(e)
      return undefined
    })
  console.log('loaded')
  //let Data45min = await generateIndicators(symbol, 45, history, true, factor)

  let {
    array: Data90min
  } = await generateIndicators('EMA', 90, history, true, factor - 2)

  console.log('90 min indicators length', Data90min.length)

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

  if (Data1min.length <= 499) {
    console.log(Data1min, history.length, symbol)
    return undefined
    //throw 'histoy length error'
  }

  console.log('start date', new Date(Number(Data1min[500]['time'])).toLocaleString())

  for (var a = 5000; a < Data1min.length; a = a + 1) { //5000
    leverage = 5
    let timestamp = Number(Data1min[a]['time'])
    let price = Number(Data1min[a]['price'])

    let testTimeframe = new Date()
    testTimeframe.setHours(testTimeframe.getHours() - 48)
    testTimeframe = testTimeframe.getTime()
    if (new Date(timestamp).getMonth() + 1 < 2 || timestamp <= 1616587714064) continue // || timestamp <= new Date('Fri, 01 Mar 2021 08:42:28 GMT').getTime()
    //a start = 8603
    //console.log(a)

    let Indicators1min = Data1min[a]
    let Indicators5min = await filterByTime(timestamp, Data5min)
    let Indicators15min = await filterByTime(timestamp, Data15min)
    //let Indicators45min = await filterByTime(timestamp, Data45min)
    let Indicators90min = await filterByTime(timestamp, Data90min)

    console.log(new Date(timestamp).toLocaleString())
    console.log(Indicators15min)
    //console.log(a, Indicators90min)

    console.log(new Date(timestamp).toLocaleString())

    //console.log('5 min', new Date(parseFloat(Indicators5min['time'])).toLocaleString(), Indicators5min['lineDirection'])
    console.log('15 min', Indicators15min)
    //console.log('90 min', new Date(parseFloat(Indicators90min['time'])).toLocaleString(), Indicators90min['lineDirection'])

    //console.log(Indicators15min)

    let lastJump = undefined

    //console.log('1',new Date(Number(timestamp)).toLocaleString())
    //console.log('2',new Date(Number(Indicators15min['time'])).toLocaleString())

    //console.log(`[${a}/${Data1min.length}/${symbol}]`)

    let profit = await calculateProfit(price)

    //if (a >= Data1min.length - 10) console.log(Indicators15min['eight'], Indicators15min['fiftyfive'], new Date(Number(Indicators15min['time'])).toLocaleString(), new Date(Number(Data1min[a]['time'])).toLocaleString(), Indicators15min['eight'] >= Indicators15min['fiftyfive'])

    let latestEntry = await getLatestTransaction('Entry')
    let latestExit = await getLatestTransaction('Exit')

    let lastTwo = transactions.slice(-3).filter(item => item['details'][1] === 'stop loss')
    //console.log('lastTwo', lastTwo.length)
    lastTwo = lastTwo.length

    //console.log(lastTwo < 1 , (lastTwo >= 1 && (new Date().getTime() - Number(latestExit['time'])) / 1000 / 60 >= 120))
    //console.log(Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1))

    let rules = {
      '1': {
        "Long Entry": [
          [
            !lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //
            //lastTwo < 1 || Indicators1min['eight'] >= Indicators1min['twentyone'],
            //Indicators1min['close'] >= Indicators1min['open'],
            //lastTwo < 1 || (lastTwo >= 1 && (new Date().getTime() - Number(latestExit['time'])) / 1000 / 60 >= 240),
            //Indicators15minFast['eight'] >= Indicators15minFast['thirteen'],
            Indicators1min['RSI']['val'] <= 65,
            Indicators5min['RSI']['val'] <= 65,
            //Math.abs(Indicators5min['eight'] / Indicators5min['fiftyfive'] - 1) <= 0.03,
            //Indicators5min['lineDirection'] >= 1,
            Indicators15min['RSI']['val'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            Indicators90min['eight'] >= Indicators90min['twentyone'], //|| Indicators15min['eight'] / Indicators15min['fiftyfive'] >= 1.015
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.5 || profit <= -1 //|| Indicators90min['lineDirection'] <= 1 
          ]
        ],
        "Short Entry": [
          [
            !lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //
            //lastTwo < 1 || Indicators1min['eight'] <= Indicators1min['twentyone'],
            //Indicators1min['close'] <= Indicators1min['open'],
            //lastTwo < 1 || (lastTwo >= 1 && (new Date().getTime() - Number(latestExit['time'])) / 1000 / 60 >= 240),
            //Indicators15minFast['eight'] <= Indicators15minFast['thirteen'],
            Indicators1min['RSI']['val'] >= 35,
            Indicators5min['RSI']['val'] >= 35,
            //Math.abs(Indicators5min['eight'] / Indicators5min['fiftyfive'] - 1) <= 0.03,
            //Indicators5min['lineDirection'] <= 1,
            Indicators15min['RSI']['val'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            Indicators90min['eight'] <= Indicators90min['twentyone'], //|| Indicators15min['eight'] / Indicators15min['fiftyfive'] <= 0.985
            Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.5 || profit <= -1 //|| Indicators90min['lineDirection'] >= 1 
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
          //Indicators5min['RSI']['val']
          //Indicators15min['HeikinAshi']['open'] >= Indicators15min['HeikinAshi']['close'],
          //Indicators15min['AO']['val'],
          //Indicators15min['RSI']['val'],
          //Indicators15minFast['eight'] / Indicators15minFast['fiftyfive'],
          //Indicators15minFast['HeikinAshi']['open'] >= Indicators15minFast['HeikinAshi']['close']
        ]
      },
      '2': {
        "Long Entry": [
          [
            !lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //
            //lastTwo < 1 || Indicators1min['eight'] >= Indicators1min['twentyone'],
            //Indicators1min['close'] >= Indicators1min['open'],
            //lastTwo < 1 || (lastTwo >= 1 && (new Date().getTime() - Number(latestExit['time'])) / 1000 / 60 >= 240),
            //Indicators15minFast['eight'] >= Indicators15minFast['thirteen'],
            Indicators1min['RSI']['val'] <= 65,
            Indicators5min['RSI']['val'] <= 65,
            //Math.abs(Indicators5min['eight'] / Indicators5min['fiftyfive'] - 1) <= 0.03,
            //Indicators5min['lineDirection'] >= 1,
            Indicators15min['RSI']['val'] <= 60,
            Indicators15min['eight'] >= Indicators15min['fiftyfive'],
            //Indicators90min['eight'] >= Indicators90min['twentyone'], //|| Indicators15min['eight'] / Indicators15min['fiftyfive'] >= 1.015
            //Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.005
          ]
        ],
        "Long Exit": [
          [
            Indicators15min['eight'] <= Indicators15min['fiftyfive'] || profit >= 0.5 || profit <= -1 //|| Indicators90min['lineDirection'] <= 1 
          ]
        ],
        "Short Entry": [
          [
            !lastJump || (Number(Data1min[a]['time']) - Number(lastJump)) / 1000 / 60 >= 15,
            //
            //lastTwo < 1 || Indicators1min['eight'] <= Indicators1min['twentyone'],
            //Indicators1min['close'] <= Indicators1min['open'],
            //lastTwo < 1 || (lastTwo >= 1 && (new Date().getTime() - Number(latestExit['time'])) / 1000 / 60 >= 240),
            //Indicators15minFast['eight'] <= Indicators15minFast['thirteen'],
            Indicators1min['RSI']['val'] >= 35,
            Indicators5min['RSI']['val'] >= 35,
            //Math.abs(Indicators5min['eight'] / Indicators5min['fiftyfive'] - 1) <= 0.03,
            //Indicators5min['lineDirection'] <= 1,
            Indicators15min['RSI']['val'] >= 40,
            Indicators15min['eight'] <= Indicators15min['fiftyfive'],
            //Indicators90min['eight'] <= Indicators90min['twentyone'], //|| Indicators15min['eight'] / Indicators15min['fiftyfive'] <= 0.985
            //Math.abs(Indicators15min['eight'] / Indicators15min['thirteen'] - 1) >= 0.0005,
            //Math.abs(Indicators90min['eight'] / Indicators90min['thirteen'] - 1) >= 0.005
          ]
        ],
        "Short Exit": [
          [
            Indicators15min['eight'] >= Indicators15min['fiftyfive'] || profit >= 0.5 || profit <= -1 //|| Indicators90min['lineDirection'] >= 1 
          ]
        ],
        'details': [
          Indicators15min['fiftyfive'],
          profit >= 0.5 ? 'take profit' : profit <= -1 ? 'stop loss' : 'standard',
          //Indicators5min['RSI']['val']
          //Indicators15min['HeikinAshi']['open'] >= Indicators15min['HeikinAshi']['close'],
          //Indicators15min['AO']['val'],
          //Indicators15min['RSI']['val'],
          //Indicators15minFast['eight'] / Indicators15minFast['fiftyfive'],
          //Indicators15minFast['HeikinAshi']['open'] >= Indicators15minFast['HeikinAshi']['close']
        ]
      }
    }

    let rule = rules['1']

    //console.log(ruleIndicator)

    for (var b in ruleIndicator) {
      //if (profit <= -5) console.log(b, rule[b], ruleIndicator)
      //if (!rule[b][ruleIndicator[b]]) continue
      if ((rule[b][ruleIndicator[b]].filter(item => item === true)).length === rule[b][ruleIndicator[b]].length) {
        ruleIndicator[b]++
      }
    }

    if (transactions.length !== 0 && transactions[transactions.length - 1]['type'].includes('Entry')) {
      //console.log('profit', profit)
      //exit order next
      ruleIndicator['Long Entry'] = 0
      ruleIndicator['Short Entry'] = 0

      let latestTransaction = transactions[transactions.length - 1]

      let timeDifference = (Number(Data1min[a]['time']) - Number(Data1min[a - 1]['time'])) / 1000 / 60
      if (timeDifference >= 5) {
        //console.log('jump', new Date(Number(Data1min[a]['time'])).toLocaleString())
        lastJump = Number(Data1min[a]['time'])
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
        profit: Number(profit),
        leverageProfit: profit * leverage,
        details: rule['details'],
        holdLength: (latestTransaction['time'] - new Date(timestamp).getTime()) / 1000 / 60 * -1 + 'min',
        generalProfit: generalProfit
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
          //if (rule['details'][1] === 'stop loss') console.log('stop loss', obj['type'], rule['details'][2])
          transactions.push(obj)
          indicatorCountReset()
        }
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
        details: rule['details']
      }

      //long
      if (ruleIndicator['Long Entry'] === rule['Long Entry'].length) {
        //console.log('long entry', new Date(timestamp).toLocaleTimeString())
        obj['type'] = 'Long Entry'
        obj['action'] = obj['type']
        transactions.push(obj)
        indicatorCountReset()
      } else if (ruleIndicator['Short Entry'] === rule['Short Entry'].length) {
        //console.log('short entry', new Date(timestamp).toLocaleTimeString())
        obj['type'] = 'Short Entry'
        obj['action'] = obj['type']
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
        } else {
          profit = Number((difference - 1) * 100 * -1).toFixed(3)
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
  let shorts = transactions.filter(item => item['type'] === 'Short Exit')
  let longs = transactions.filter(item => item['type'] === 'Long Exit')

  async function avgDailyProfit() {
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

  let result = {
    profit: 1,
    leverageProfit: 1,
    transactions: transactions.length,
    ratio: exits.filter(item => item['profit'] >= 0).length / exits.length,
    ratioShorts: shorts.filter(item => item['profit'] >= 0).length / shorts.length,
    ratioLongs: longs.filter(item => item['profit'] >= 0).length / longs.length,
    leverage: leverage,
    factor: factor,
    avgDailyProfit: exits.length >= 1 ? await avgDailyProfit() : 'no exits'
  }

  let string = ''

  exits.forEach(item => {
    if (item['profit'] === 0) throw 'profit error'
    result['profit'] = Number(result['profit'] * (1 + item['profit'] / 100)).toFixed(5)
    result['leverageProfit'] = Number(result['leverageProfit'] * (1 + item['leverageProfit'] / 100)).toFixed(5)
    //console.log((1 + item['leverageProfit'] / 100), result['leverageProfit'])
  })

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

  function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
  }

  fs.writeFileSync('./string_formatted.txt', replaceAll(string, '.', ','), {
    encoding: 'utf-8'
  })

  //console.log(exits.sort(function(a, b){return b['leverageProfit']-a['leverageProfit']}))

  //console.log('profit in prozent')
  result['leverageProfit'] = Number((result['leverageProfit'] - 1) * 100).toFixed(3) + '%'
  result['profit'] = Number((result['profit'] - 1) * 100).toFixed(3) + '%'
  //console.log(result)

  fs.writeFileSync(`./data/${symbol}PERP_transactions.json`, JSON.stringify(transactions, null, 3), {
    encoding: 'utf-8'
  })
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
  arr = arr.slice(Math.max(arr.length - 16, 0))
  let sum = 1
  for (var a = 1; a < arr.length; a++) {
    //console.log(arr[a] / arr[a - 1])
    sum = sum * (arr[a] / arr[a - 1])
  }
  //console.log('sum', sum)
  return sum // arr.length
}

async function avgVolatility(array, granularity, hours) {
  let date = new Date()
  date.setHours(date.getHours() - hours)
  console.log(date.toLocaleString())
  array = array.filter(item => parseFloat(item['time']) >= date.getTime())
  console.log(array.length)
  let sum = 0
  let temp = array.filter((x, i) => i % granularity == 0)

  for (var a = 1; a < temp.length; a++) {
    sum = sum + (Math.abs(parseFloat(temp[a]['high']) / parseFloat(temp[a - 1]['low'])) - 1)
  }
  //console.log(sum)
  return sum / temp.length
}
