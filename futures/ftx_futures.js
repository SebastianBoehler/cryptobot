const fetch = require('node-fetch');
const fileUtils = require('../fileUtils');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const {
  RestClient,
  WebsocketClient
} = require('ftx-api');

const FTXClient = new RestClient('AYCUnemwv-b9j1LWKDm5cEI', 'ywNqtvLE6TBKD8MgNp8oqr7CRkttfx');
const tempDatabase = {}

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
  process.exit()
  //webhook.send(error.message + '\n' + error.name)
});

//console.log('started')
let data = {}

async function updateDatabase(id, ticker) {
  return new Promise(async (resolve, reject) => {
    //console.log(id)
    var history = await fileUtils.loadData(id, 'FTX', 'latest')
      .catch(e => {
        console.log('error load Data', e)
        return 'table'
      })
    //console.log(id, history.length)
    if (history === 'table') {
      console.log('resolve because of error')
      resolve()
      return
    } else if (!history) history = []
    var ago = new Date()
    ago.setSeconds(ago.getSeconds() - 59)
    const now = new Date()

    //console.log(product)

    //console.log('history', history.length)

    var expiration = new Date()
    expiration.setHours(expiration.getHours() - 6000) //250 Tage

    if (history.length >= 1 && Number(history[history.length - 1]['time']) > ago.getTime()) {
      resolve()
      return
    } else if (!data[ticker]['data']) {
      resolve()
      return
    }

    var oldest = await fileUtils.loadData(id, 'FTX', 'oldest')
      .catch(e => {
        console.log('error load Data', e)
        return 'table'
      })

    var removed = false
    for (var c in oldest) {
      if (Number(oldest[c]['time']) < expiration.getTime()) {
        await fileUtils.removeData(id, oldest[c]['id'], 'FTX')
        removed = true
      }
    }

    if (removed && false) {
      console.log('removed value', id)
      resolve()
      return
    }

    const latest = data[ticker]['data']

    //console.log(latest, id)
    if (!latest) {
      console.log('no latest')
      resolve()
      return
    }

    var object = {
      //profit: obj['profit'],
      volume: latest['volume'],
      time: latest['time'],
      price: latest['close'],
      bid: '',
      ask: '',
      open: latest['open'],
      close: latest['close'],
      high: latest['high'],
      low: latest['low']
    }
    //console.log(tempArray.map(item => item['price']))

    //console.log(object)

    if (history.length === 0) {
      console.log('pushing new value')
      await fileUtils.pushData(id, object, 'FTX')
        .catch(e => {
          console.log(e)
        })
    } else if (Number(history[history.length - 1]['time']) < ago.getTime()) {
      console.log('pushing new value', new Date(Number(history[history.length - 1]['time'])).toLocaleTimeString(), new Date(object['time']).toLocaleTimeString(), id, history.length)
      await fileUtils.pushData(id, object, 'FTX')
        .catch(e => {
          console.log(e)
        })
    }
    //console.log('done')
    resolve()
  })
}
async function main() {
  let markets = await FTXClient.getMarkets()
    .catch(e => {
      console.log(e)
      return {
        success: false
      }
    })
  if (!markets['success']) {
    main()
    return
  } else markets = markets['result']
  for (var a in markets) {
    let item = markets[a]
    if (item['type'] !== 'future' || !item['name'].includes('PERP')) continue
    if (!data[item['name']]) data[item['name']] = {
      symbol: item['name'],
      time: new Date().getTime(),
      data: null
    }
  }
  checker()
  setTimeout(() => {
    main()
  }, 1000 * 60 * 60 * 12);
};

main()

async function checker() {
  for (var b in data) {
    let item = data[b]
    let expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() - 61)
    if (item['time'] >= expiration) continue
    let start = new Date()
    start.setMinutes(start.getMinutes() - 3)
    let prices = await FTXClient.getHistoricalPrices({
      market_name: item['symbol'],
      resolution: 60,
      start_time: start.getTime() / 1000
    })
      .catch(e => {
        console.log(e)
        return {
          success: false
        }
      })
    if (!prices['success']) continue
    else prices = prices['result']
    let obj = prices[prices.length - 1]
    if (obj['time'] === item['time']) continue
    if (!item['data']) await sleep(150)
    data[b]['data'] = obj
    data[b]['time'] = obj['time']
    console.log('write new data', item['symbol'], new Date(obj['time']).toLocaleTimeString())
    await updateDatabase(item['symbol'].replace('-', ''), item['symbol'])
      .catch(e => {
        console.log(e.message)
      })
  }
  await sleep(100)
  checker()
}
