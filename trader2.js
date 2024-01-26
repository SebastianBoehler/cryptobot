const Binance = require('node-binance-api');
const fs = require('fs');
const fileUtils = require('./fileUtils');
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();
const fetch = require('node-fetch');
const chalk = require('chalk');
const Discord = require("discord.js");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const open = require('open');
const crypto = require('crypto');
const indicators2 = require('./indicators2.js');

const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());

let account = {
  portfolio: 'Bastis Portfolio',
  key: 'PfUjDL7zgqZAnlOJ6LZi6bLYF7Uw31fhnUlwu',
  secret: 'c2l7AwvZ6cemt33H209WDGtguxm1AAszejM9XUV2Vb',
  active: true,
  tradingEnabled: false,
  platform: 'Binance',
  size: 0.5,
  trade: [ //curencies to trade with
    'XRPBTC',
    'COVERETH',
    'XRPEUR',
    'SNTETH',
    'BTCUSDT'
  ]
}

let channels = {
  'COINBASE': {
    'LINKETH': {
      id: '789429905427267584',
      token: 'E9op9H6C3szQ9S18zOHg4wlU8SL6S3WUDALheVS-j9I1eeyAdLEGKBtjfYjS_39sXp7s'
    }
  },
  'BINANCE': {
    'XRPEUR': {
      id: '789430333044031507',
      token: '6p2AiC-0yn7_I1zSUWhSLI6pwYgal6li4Kv5ltFHhCyM-2r5'
    },
    'COVERETH': {
      id: '789483221241954336',
      token: 'w7b6r4kHAU8fNsqS2Z_IJtiJrsY9DXbm9USRO3EE8CgwZtsHfCfnsc5E'
    },
    'XRPBTC': {
      id: '789483502197801000',
      token: 'Z2S-AeHIn3jf2HxFxy5VpdDZwb1ndFUviZdBsx6IkaRr78Y'
    }
  }
}

const webhook = new Discord.WebhookClient('776017258564157442', 'TID_qcqYUROzy2na7a5OxReV-MzPgQBf5kFVQOF100c6eaMPDTcPw8');


class Cryptobot {
  constructor(account, id) {
    this.id = id
    this.platform = account['platform']
    if (this.platform === 'Binance') {
      this.authedClient = new Binance().options({
        APIKEY: account['key'],
        APISECRET: account['secret']
      });
    } else if (this.platform === 'Coinbase') {
      this.authedClient = new CoinbasePro.AuthenticatedClient(
        account['key'],
        account['secret'],
        account['passphrase'],
        'https://api.pro.coinbase.com'
      )
    }
  };

  async allProducts() {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        await fetch('https://api.binance.com/api/v3/ticker/price')
          .then(async resp => {
            const data = await resp.json()
            this.price = (data.filter(item => item['symbol'] === this.id))[0]['price']
            resolve(data)
          })
          .catch(e => {
            console.log(e)
            reject(e)
          })
      } else if (this.platform === 'Coinbase') {
        publicClient.getProducts((err, response, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      }
    })
  };

  async productDetails() {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        await fetch('https://api.binance.com/api/v3/exchangeInfo')
          .then(async resp => {
            const data = await resp.json()
            let details = data['symbols'].filter(item => item['symbol'] === this.id)
            resolve(details[0])
          })
          .catch(e => {
            console.log(e)
            reject(e)
          })
      } else if (this.platform === 'Coinbase') {
        publicClient.getProducts((err, response, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      }
    })
  }

  async getBalances() {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        this.authedClient.balance((error, balances) => {
          if (error) reject(error)
          else resolve(balances)
        });
      } else if (this.platform === 'Coinbase') {
        await this.authedClient.getAccounts()
          .then(data => {
            //console.log(data)
            resolve(data)
          })
          .catch(e => {
            reject(e)
          })
      }
    })
  };

  async buy(quantity, price) {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        console.log('buying with', parseFloat(quantity))
        this.authedClient.buy(this.id, parseFloat(quantity), price, {
          type: 'LIMIT'
        }, async (error, response) => {
          if (error) reject(error)
          else {
            await this.sendData(response)
            resolve(response)
          }
        });
      } else if (this.platform === 'Coinbase') {
        const buyParams = {
          price: Number(price), // USD
          size: quantity, // BTC
          product_id: id,
          type: 'limit'
        };
        this.authedClient.buy(buyParams, async (err, response, data) => {
          if (err) reject(err)
          else {
            await this.sendData(data)
            resolve(data)
          }
        })
      }
    })
  };

  async sell(quantity, price) {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        console.log('selling with', parseFloat(quantity))
        this.authedClient.sell(this.id, parseFloat(quantity), price, {
          type: 'LIMIT'
        }, async (error, response) => {
          if (error) reject(error)
          else {
            await this.sendData(response)
            resolve(response)
          }
        });
      } else if (this.platform === 'Coinbase') {
        const sellParams = {
          price: Number(price), // USD
          size: quantity, // BTC
          product_id: id,
          type: 'limit'
        };
        this.authedClient.sell(sellParams, async (err, response, data) => {
          if (err) reject(err)
          else {
            await this.sendData(data)
            resolve(data)
          }
        })
      }
    })
  };

  async checkOrder(id, orderid) {
    return new Promise((resolve, reject) => {
      if (this.platform === 'Binance') {
        this.authedClient.orderStatus(id, orderid, (error, orderStatus, symbol) => {
          if (error) reject(error)
          else resolve(orderStatus)
        });
      } else if (this.platform === 'Coinbase') {
        this.authedClient.getOrder(orderid, async (err, response, data) => {
          if (err) reject(err)
          else {
            //await sleep(2500)
            resolve(data)
          }
        })
      }
    })
  };

  async sendData(data) {
    //https://discord.com/api/webhooks/776017258564157442/TID_qcqYUROzy2na7a0c3t2odTAe4n705OxReV-MzPgQBf5kFVQOF100c6eaMPDTcPw8
    var embed = new Discord.MessageEmbed()
    embed.setTitle(`${data['side']} ${data['product_id'] || data['symbol']} on ${this.platform}`)
    embed.setDescription(`Placed order at ${new Date().toLocaleTimeString()}`)
    if (data['status']) embed.addField('Status', data['status'])
    await webhook.send(embed)

  }

  async sendDiscord(data) {
    var embed = new Discord.MessageEmbed()
    embed.setTitle(data['title'])
    embed.setDescription(data['description'])
    for (var a in data['fields']) {
      if (data['fields'][a]['title'] === 'Profit') {
        if (parseFloat(data['fields'][a]['text']) > 0) embed.setColor('#00cc25')
        else embed.setColor('#cc0000')
      }
      embed.addField(data['fields'][a]['title'], data['fields'][a]['text'])
    }
    await webhook.send(embed)
  }
}

app.post('/action', async (req, res) => {
  //console.log('id', req.params['id'])
  let data = req.body
  res.json({
    status: 'success'
  })
  console.log(data, account.trade.indexOf(data['ticker']))
  if (account.trade.indexOf(data['ticker']) >= 0 || !account['tradingEnabled']) await executeAction(data)
  if (channels[data['exchange']] && channels[data['exchange']][data['ticker']]) {
    //send discord
    let config = channels[data['exchange']][data['ticker']]
    let hook = new Discord.WebhookClient(config['id'], config['token'])
    let embed = new Discord.MessageEmbed()
    //embed.setAuthor('BOEHLER TRADING SINGAL SERVICE')
    embed.setTitle(`${data['exchange']}:${data['ticker']}`)
    embed.setURL(`https://de.tradingview.com/symbols/${data['ticker']}/?exchange=${data['exchange']}`)
    embed.addField('Signal Type', `**${data['action']}**`)
    embed.addField('Average Hold Time', 'NaN')
    embed.addField('Strategy Name', `${data['strategy'] || 'NaN'}`)
    embed.setFooter(`BOEHLER TRADING SINGAL SERVICE`)
    hook.send(embed)
  }
});

app.get('/account', function (req, res) {
  res.json(account)
  //res.download(__dirname + '/data.json')
})

app.get('/reset', function (req, res) {
  for (var a in account['trade']) {
    let path = `./data/${account['trade'][a]}-data.json`
    let obj = {
      transactions: [],
      profits: []
    }
    fs.writeFileSync(path, JSON.stringify(obj), {
      encoding: 'utf-8'
    })
  }
  res.json({
    status: 'success'
  })
  //res.download(__dirname + '/data.json')
})

app.post('/addPair', function (req, res) {
  let data = req.body
  account['trade'].push(data['pair'])
  res.json(account)
  //res.download(__dirname + '/data.json')
})

app.post('/removePair', function (req, res) {
  let data = req.body
  let index = account['trade'].indexOf(data['pair'])
  account['trade'].splice(index, 1)
  res.json(account)
  //res.download(__dirname + '/data.json')
})

app.get('*', function (req, res) {
  res.send('invalid url')
  //res.download(__dirname + '/data.json')
})

async function executeAction(data) {
  console.log('--------------------------------')
  let path = `./data/${data['ticker']}-data.json`
  let obj = {
    transactions: [],
    profits: []
  }
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(obj), {
      encoding: 'utf-8'
    })
  } else {
    obj = fs.readFileSync(path, {
      encoding: 'utf-8'
    })
    obj = JSON.parse(obj)
  }
  var myBot = new Cryptobot(account, data['ticker'])
  let allProducts = await myBot.allProducts()
  let price = (allProducts.filter(item => item['symbol'] === data['ticker']))[0]['price'] //curent price
  price = Number(price)
  let details = await myBot.productDetails()
  let decimals = details['filters'][2]['stepSize']
  console.log('step size', decimals)
  decimals = Number(decimals).countDecimals()
  //console.log(JSON.stringify(details, null, 3))
  let balances = await myBot.getBalances()
  //console.log('balances', JSON.stringify(balances, null, 3))
  let size = 0
  if (data['action'] === 'buy') {
    if (obj['transactions'].length >= 1) {
      //check if bought / sold
      if (obj['transactions'][obj['transactions'].length - 1]['type'] !== 'sell') {
        console.log('trying to buy, but there is no sell!')
        return
      }
    }
    console.log('balance', balances[details['quoteAsset']])
    size = (parseFloat(balances[details['quoteAsset']]['available']) * account['size']) / price
    size = Number(size).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + decimals + '})?'))[0]
    console.log('buy market', data['ticker'], size, details['quoteAsset'])
    console.log('decimals', decimals)
    if (account['tradingEnabled']) {
      let buyResp = await myBot.buy(size, Number(price * 1.003).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(price).countDecimals() + '})?'))[0])
        .catch(e => {
          console.log('buy error', e['body'])
          return undefined
        })
      if (buyResp) {
        console.log(JSON.stringify(buyResp, null, 2))
        obj['transactions'].push({
          orderId: buyResp['orderId'] || await rndString(),
          type: data['action'],
          price: price * 1.003,
          id: data['ticker'],
          time: new Date().getTime(),
          balance: parseFloat(balances[details['quoteAsset']]['available']),
          details: buyResp
        })
      }
    } else {
      obj['transactions'].push({
        orderId: await rndString(),
        type: data['action'],
        price: price * 1.005,
        id: data['ticker'],
        time: new Date().getTime(),
        balance: parseFloat(balances[details['quoteAsset']]['available'])
      })
    }
  } else if (data['action'] === 'sell') {
    if (obj['transactions'].length === 0) return
    else if (obj['transactions'][obj['transactions'].length - 1]['type'] !== 'buy') return
    console.log('balance', balances[details['baseAsset']])
    console.log(`${data['ticker']} general Profit`, await calculateProfit())
    //sell everything
    let profit = -1 * (1 - price * 0.995 / obj['transactions'][obj['transactions'].length - 1]['price']) - 0.00075
    size = parseFloat(balances[details['baseAsset']]['available'])
    console.log('sell market', data['ticker'], size, details['baseAsset'])
    console.log('decimals', decimals)
    console.log('profit', data['ticker'], profit)
    if (account['tradingEnabled']) {
      var sellPrice = Number(price * 0.997).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(price).countDecimals() + '})?'))[0]
      let sellResp = await myBot.sell(Number(size).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + decimals + '})?'))[0], sellPrice)
        .catch(e => {
          console.log('sell error', e['body'])
          return undefined
        })
      if (sellResp) {
        let orderId = sellResp['orderId'] || await rndString()
        console.log('sell response', JSON.stringify(sellResp, null, 2))
        obj['transactions'].push({
          orderId: orderId,
          type: data['action'],
          price: price * 0.997,
          id: data['ticker'],
          time: new Date().getTime(),
          balance: size,
          details: sellResp
        })
        obj['profits'].push({
          orderId: orderId,
          time: new Date().getTime(),
          profit: profit,
          balance: size
        })
      }
    } else {
      let orderId = await rndString()
      obj['transactions'].push({
        orderId: orderId,
        type: data['action'],
        price: price,
        id: data['ticker'],
        time: new Date().getTime(),
        balance: size
      })
      obj['profits'].push({
        orderId: orderId,
        time: new Date().getTime(),
        profit: profit,
        marginProfit: Number(profit) * 3,
        balance: size
      })
    }

    async function calculateProfit() {
      const profits = obj['profits']
      var number = 1
      for (var d in profits) {
        number = number * (1 + profits[d]['profit'])
      }
      return Number(number)
    }
  }

  //filter for orders
  for (var a in obj['transactions']) {
    break
    let transaction = obj['transactions'][a]
    console.log(transaction['details']['status'])
  }
  fs.writeFileSync(path, JSON.stringify(obj), {
    encoding: 'utf-8'
  })
}



http.createServer(app).listen(80, () => {
  console.log('Express server listening')
});

Number.prototype.countDecimals = function () {
  //console.log('countDecimals',this.valueOf())
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  else if (this.toString().includes('1e')) return Number(this.toString().split('-')[1]);
  return this.toString().split(".")[1].length || 0;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function rndString() {
  var tokens = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    chars = 5,
    segments = 4,
    keyString = "";

  for (var i = 0; i < segments; i++) {
    var segment = "";

    for (var j = 0; j < chars; j++) {
      var k = getRandomInt(0, 35);
      segment += tokens[k];
    }

    keyString += segment;

    if (i < (segments - 1)) {
      keyString += "-";
    }
  }

  return keyString;

}


setInterval(async () => {
  for (var a in account['trade']) {
    var id = account['trade'][a]
    var path = `./data/${id}-data.json`
    if (!fs.existsSync(path)) continue
    var raw = fs.readFileSync(path, {
      encoding: 'utf-8'
    })
    var data = JSON.parse(raw)
    const profits = data['profits']
    var number = 1
    let numberMargin = 1
    for (var d in profits) {
      number = number * (1 + profits[d]['profit'])
      numberMargin = numberMargin * (1 + profits[d]['marginProfit'])
    }
    var embed = new Discord.MessageEmbed()
    embed.setTitle('TRADING OVERVIEW ' + id)
    embed.setURL(`https://de.tradingview.com/symbols/${id}/?exchange=BINANCE`)
    embed.setDescription(`General profit from ${id}: **${Number(number).toFixed(3)}**\nMargin Profit ${Number(numberMargin).toFixed(3)}`)
    embed.addField('Amount of Trades', data['transactions'].length)
    embed.setFooter('BOEHLER TRADING SIGNALS SERVICE')
    webhook.send(embed)
  }
}, 1000 * 60 * 30);
