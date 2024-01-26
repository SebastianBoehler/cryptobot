const Binance = require('node-binance-api');
const fetch = require('node-fetch');
const binance = new Binance().options({
  APIKEY: 'RbylZBGeoAys1HIPRYAnhDjvyy5JT7wd8MqJ2gzmb0YGQM6G',
  APISECRET: 'foFzRzh6zHbqh2oNvvqDNbvCa4m1rccNzTJQaoXu1630fxAcVkkl'
});
let fileUtils = require('../fileUtils');
let {
  generateIndicators
} = require('../indicators')

var ratios = {}

main()
async function main() {
  let pairs = await binance.futuresPrices()
  for (var a in pairs) {
    //console.log(a)
    var history = await fileUtils.loadData(a, 'BINANCE', 5000)
      .catch(e => {
        console.log('error load Data', e)
        return undefined
      })
    if (!history) continue
    //console.log(history[history.length - 1])
    //console.log(history.length)
    if (history.length <= 4500) continue

    let factor = 1
    const object = {
      'eight': parseInt(8 * factor),
      'thirteen': parseInt(13 * factor),
      'twentyone': parseInt(21 * factor),
      'fiftyfive': parseInt(55 * factor)
    }

    var {
      array: array5min
    } = await generateIndicators('EMA', 5, history, true, object);
    array5min = array5min.filter(item => item['fiftyfive'] !== undefined)
    let latest5min = array5min[array5min.length - 1]
    //console.log(array5min[array5min.length - 1]['eight'] <= array5min[array5min.length - 1]['fiftyfive'])

    var {
      array: array25min
    } = await generateIndicators('EMA', 25, history, true, object);
    array25min = array25min.filter(item => item['fiftyfive'] !== undefined)
    let latest25min = array25min[array25min.length - 1]
    //console.log(array25min[array25min.length - 1]['eight'] <= array5min[array25min.length - 1]['fiftyfive'])

    var {
      array: array60min
    } = await generateIndicators('EMA', 60, history, true, object);
    array60min = array60min.filter(item => item['fiftyfive'] !== undefined)
    let latest60min = array60min[array60min.length - 1]
    //console.log(array60min[array60min.length - 1]['eight'] <= array60min[array60min.length - 1]['fiftyfive'])
    let difference = (latest5min['eight'] / latest5min['fiftyfive'] + latest25min['eight'] / latest25min['fiftyfive'] + latest60min['eight'] / latest60min['fiftyfive']) / 3
    if (difference < 0) difference * -1

    var lineArray = history.map(item => Number(item['twentyone']))
    lineArray = lineArray.slice(lineArray.length - 7, lineArray.length)
    const lineMove = await lineMoving()
    var lineTrend = 0

    if (lineMove['count'] >= lineMove['length'] * 0.75) lineTrend = 1
    else if (lineMove['count'] <= lineMove['length'] * 0.5) lineTrend = -1

    async function lineMoving() {
      return new Promise((resolve, reject) => {
        var count = 0
        var previous = undefined
        for (var a in lineArray) {
          if (!previous) previous = lineArray[a]
          else {
            if (lineArray[a] > previous) count++
            previous = lineArray[a]
          }
        }
        resolve({
          count: count,
          length: lineArray.length
        })
      })
    }
    //console.log(difference)
    let checks = [
      latest5min['eight'] >= latest5min['fiftyfive'],
      latest25min['eight'] >= latest25min['fiftyfive'],
      latest60min['eight'] >= latest60min['fiftyfive'],
      difference >= 1.04,
      latest25min['RSI']['val'] >= 50,
      latest25min['RSI']['crossUp'],
      latest25min['HeikinAshi']['close'] >= latest25min['HeikinAshi']['open'],
      latest25min['AO']['val'] >= 0,
      latest25min['AO']['val'] >= latest25min['AO']['prev'],
      latest25min['IchimokuCloud']['base'] >= latest25min['IchimokuCloud']['spanA'],
      latest5min['close'] >= latest5min['BollingerBands']['lower'],
      lineTrend === 1,
    ]

    let ratio = (checks.filter(item => item === true)).length / checks.length

    ratios[a] = ratio

    //console.log(`${a}: ${(checks.filter(item => item === true)).length}/${checks.length}, ratio: ${ratio}`)
  }
}

let transactions = {}
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

setInterval(async () => {
  for (var a in ratios) {
    console.log(JSON.stringify({
      "ticker": a,
      "exchange": "BINANCE",
      "action": "buy",
      //"close": "{{close}}",
      "message": "go long"
      //"position": "{{strategy.market_position}}"
    }))
    if (!transactions[a]) transactions[a] = []
    if (ratios[a] >= 0.75) {
      //go long
      if (transactions[a][transactions[a].length - 1] && transactions[a][transactions[a].length - 1]['type'] === 'buy') continue
      await fetch(`http://boehler-trading.com/action?id=49327715-f043-4a36-8e3c-717e7677cde6&ticker=${a}&action=buy&exchange=BINANCE`, {
        method: 'POST',
        headers: myHeaders,
      })
        .then(async resp => {
          let data = await resp.json()
          if (data['status'] === 'success') {
            transactions[a].push({
              type: 'buy',
              time: new Date()
            })
          }
        })
    } else if (ratios[a] <= 0.42) {
      if (transactions[a][transactions[a].length - 1] && transactions[a][transactions[a].length - 1]['type'] === 'sell') continue
      await fetch(`http://boehler-trading.com/action?id=49327715-f043-4a36-8e3c-717e7677cde6&ticker=${a}&action=sell&exchange=BINANCE`, {
        method: 'POST',
        headers: myHeaders,
      })
        .then(async resp => {
          let data = await resp.json()
          if (data['status'] === 'success') {
            transactions[a].push({
              type: 'sell',
              time: new Date()
            })
          }
        })
    }
  }
}, 1000);
