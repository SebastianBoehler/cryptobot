const fetch = require('node-fetch');
const fileUtils = require('../fileUtils');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'PfUjDL7zg2dsfqZAnlOJ6LZi6bLYF7Uw31fhnUlwu',
  APISECRET: 'c2l7AwvZ6cemt33H209Wx44gzkDGtguxm1AAszejM9XUV2Vb'
});

const tempDatabase = {}
var data

binance.futuresMiniTickerStream(miniTicker => {
  data = miniTicker
  //console.log('mini ticker data')
})

//console.log('started')

async function updateDatabase(id) {
  return new Promise(async (resolve, reject) => {
    //console.log(id)
    var history = await fileUtils.loadData(id, 'BINANCE', 'latest')
      .catch(e => {
        console.log('error load Data', e)
        return 'table'
      })
    //console.log(id, history.length)
    if (history === 'table') {
      resolve()
      return
    }
    else if (!history) history = []
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
    }
    else if (!tempDatabase[id]) {
      resolve()
      return
    }

    var oldest = await fileUtils.loadData(id, 'BINANCE', 'oldest')
      .catch(e => {
        console.log('error load Data', e)
        return 'table'
      })

    var removed = false
    for (var c in oldest) {
      if (Number(oldest[c]['time']) < expiration.getTime()) {
        await fileUtils.removeData(id, oldest[c]['id'], 'BINANCE')
        removed = true
      }
    }

    if (removed && false) {
      console.log('removed value', id)
      resolve()
      return
    }

    const tempArray = tempDatabase[id].filter(item => item['time'] >= ago.getTime())
    const latest = tempArray[tempArray.length - 1]

    console.log(latest, id)
    if (!latest) {
      resolve()
      return
    }

    var object = {
      //profit: obj['profit'],
      volume: '',
      time: latest['time'],
      price: latest['price'],
      bid: '',
      ask: '',
      open: tempArray[0]['price'],
      close: latest['price'],
      high: Math.max(...tempArray.map(item => item['price'])),
      low: Math.min(...tempArray.map(item => item['price']))
    }
    //console.log(tempArray.map(item => item['price']))

    //console.log(object)

    if (history.length === 0) {
      console.log('pushing new value')
      await fileUtils.pushData(id, object, 'BINANCE')
        .catch(e => {
          console.log(e)
        })
    } else if (Number(history[history.length - 1]['time']) < ago.getTime()) {
      console.log('pushing new value', new Date(Number(history[history.length - 1]['time'])).toLocaleTimeString(), new Date(object['time']).toLocaleTimeString(), id, history.length)
      await fileUtils.pushData(id, object, 'BINANCE')
        .catch(e => {
          console.log(e)
        })
    }
    //console.log('done')
    resolve()
  })
}

async function main() {
  for (var d in data) {
    if (!data[d]) continue
    const id = data[d]['symbol'] + 'PERP'
    //console.log(id, 'inside main')
    await updateDatabase(id)
  }
  main()
};

(async () => {
  await sleep(15000)
  main()
})()


setInterval(async () => {
  var timestamp = new Date().getTime()
  for (var a in data) {
    //console.log('data', data[a])
    let symbol = data[a]['symbol'] + 'PERP'
    if (!tempDatabase[symbol]) tempDatabase[symbol] = []
    tempDatabase[symbol].push({
      time: timestamp,
      price: Number(data[a]['close'])
    })
  }

  for (var b in tempDatabase) {
    for (var c in tempDatabase[b]) {
      var expiration = new Date()
      expiration.setSeconds(expiration.getSeconds() - 65)
      if (tempDatabase[b][c]['time'] < expiration.getTime()) {
        //console.log('remove value from', new Date(tempDatabase[b][c]['time']).toLocaleTimeString(), tempDatabase[b].length)
        tempDatabase[b].splice(c, 1)
      }
    }
  }
}, 1000);
