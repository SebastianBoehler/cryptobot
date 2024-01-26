const Binance = require('node-binance-api');
const fs = require('fs');
const fileUtils = require('./fileUtils');
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();
var {
  indicators
} = require('./indicators2.js');
const fetch = require('node-fetch');
const chalk = require('chalk');
const Discord = require("discord.js");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const open = require('open');
const crypto = require('crypto');
const indicators2 = require('./indicators2.js');

const webhook = new Discord.WebhookClient('776017258564157442', 'TID_qcqYUROzyPgQBf5kFVQOF100c6eaMPDTcPw8');

const accounts = [{
  portfolio: 'Binance #1',
  key: 'PfUjDL7zg2dufqZAnlOJ6LZi6bLYF7Uw31fhnUlwu',
  secret: 'c2l7AwvZ6cemt33H209Wxuh6ejM9XUV2Vb',
  active: true,
  indicator: new indicators(),
  tradingEnabled: false,
  platform: 'Binance',
  tradingPair: 'IOSTBTC',
  size: 0.4,
  decimals: 0,
  buy: 'BTC',
  sell: 'IOST',
  factor: 1,
},
{
  portfolio: 'Binance #1',
  key: 'PfUjDvsfqZAnlOJ6LZi6bLYF7Uw31fhnUlwu',
  secret: 'c2l7AwvZ6cemt33H209WxV2Vb',
  active: true,
  indicator: new indicators(),
  tradingEnabled: false,
  platform: 'Binance',
  tradingPair: 'DODGEBTC',
  size: 0.4,
  decimals: 0,
  buy: 'BTC',
  sell: 'DODGE',
  factor: 1,
}
]


class Cryptobot {
  constructor(account) {
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

  async buy(id, quantity, price) {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        this.authedClient.buy(id, quantity, price, {
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

  async sell(id, quantity, price) {
    return new Promise(async (resolve, reject) => {
      if (this.platform === 'Binance') {
        this.authedClient.sell(id, quantity, price, {
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

main()

async function main() {
  for (var a in accounts) {
    await sleep(250)
    const platform = accounts[a]['platform']
    if (!accounts[a]['active']) continue
    var isBuyNext = false
    var isSellNext = false
    const cryptobot = new Cryptobot(accounts[a])
    var allProducts = await cryptobot.allProducts()
      .catch(e => {
        return undefined
      })
    if (!allProducts) continue
    console.log('-----------------------------')

    const id = accounts[a]['tradingPair']
    var product = allProducts.find(item => item['symbol'] === id || item['id'] === id)

    console.log(accounts[a]['portfolio'], id)
    let history = await fileUtils.loadData(id, accounts[a]['platform'].toUpperCase(), undefined, 6000)
      .catch(e => {
        console.log(e.name)
        process.exit()
        return undefined
      })
    if (!history) continue

    let indicator = accounts[a]['indicator']
    await indicator.loadData(id, platform, 1607276191994) //same timeframe as ruleTester to produce same results
    await indicator.loadIndicators()
    await indicator.updateDatabase().catch(e => {
      console.log(e)
    })

    const path = `./data/${id}-data.json`
    const price = Number(product['price']) || Number(history[history.length - 1]['price'])

    var timeframe = new Date()
    timeframe.setHours(timeframe.getHours() - 24 * 3)
    const max = Math.max(...history.filter(item => Number(item['time']) >= timeframe.getTime()).map(item => Number(item['price'])))
    const min = Math.min(...history.filter(item => Number(item['time']) >= timeframe.getTime()).map(item => Number(item['price'])))
    const difference = max / min
    const zehntel = (difference - 1) * 0.1

    if (!fs.existsSync(path) || accounts[a]['reset']) {
      const plain = {
        buyRuleNo: 0,
        sellRuleNo: 0,
        bought: {},
        sold: {},
        corridor: {},
        data: {},
        transactions: [],
        profits: []
      }
      fs.writeFileSync(path, JSON.stringify(plain), {
        encoding: 'utf-8'
      })
    }

    var obj = fs.readFileSync(path, 'utf-8')
    obj = JSON.parse(obj)
    var transactions = obj['transactions']
    var corridor = obj['corridor']

    if (!obj['take_profit']) obj['take_profit'] = false
    if (!obj['indicator'] || obj['indicator'] !== 'EMA') obj['indicator'] = 'EMA'

    async function getLastSell() {
      var sell = undefined
      var sells = transactions.filter(item => item['type'] === 'sell' && !item['take_profit'])
      if (sells.length >= 1) sell = sells[sells.length - 1]
      return sell
    }

    async function getLastBuy() {
      var buy = undefined
      var buys = transactions.filter(item => item['type'] === 'buy')
      if (buys.length >= 1) buy = buys[buys.length - 1]
      return buy
    }

    for (var c in transactions) {
      if (platform === 'Binance') {
        if (!transactions[c]['details']['status']) continue
        if (transactions[c]['details']['status'] === 'NEW' || transactions[c]['details']['status'] === 'PARTIALLY_FILLED') {
          const status = await cryptobot.checkOrder(id, transactions[c]['details']['orderId'])
            .catch(e => {
              console.log('orderstatus error', e)
              return undefined
            })
          //console.log('order status checked', status)
          if (!status) continue
          transactions[c]['details'] = status
          if (status['status'] === 'FILLED') {
            var embed = new Discord.MessageEmbed()
            embed.setTitle(`FILLED ${transactions[c]['type'].toUpperCase()} ${transactions[c]['details']['product_id'] || transactions[c]['details']['symbol']} on ${platform}`)
            embed.setDescription(`Filled order at ${new Date().toLocaleTimeString()}`)
            if (transactions[c]['type'] === 'sell') {
              embed.addField('Profit', Number((obj['profits'].find(item => item['order'] === transactions[c]['details']['orderId']))['profit'] * 100 - 1) || undefined, true)
              if (parseFloat((obj['profits'].find(item => item['order'] === transactions[c]['details']['orderId']))['profit'] * 100 - 1) > 0) embed.setColor('#00cc25')
              else embed.setColor('#cc0000')
              if ((obj['profits'].find(item => item['order'] === transactions[c]['details']['orderId']))['takeProfit']) embed.addField('Take Profit', 'True', true)
              //embed.addField('Profit', JSON.stringify(obj['profits'].find(item => item['order'] === transactions[c]['details']['orderId'])))
            }
            await webhook.send(embed)
          } //else console.log('there are open orders')
        } else if (transactions[c]['details']['status'] === 'CANCELED') {
          console.log('remove transaction')
          for (var d in obj['profits']) {
            if (obj['profits']['order'] === transactions[c]['details']['orderId']) obj['profits'].splice(d, 1)
          }
          transactions.splice(c, 1)
        }
      } else if (platform === 'Coinbase') {
        if (transactions[c]['details']['status'] !== 'done') {
          const status = await cryptobot.checkOrder(id, transactions[c]['details']['id'])
            .catch(e => {
              console.log('orderstatus error', e)
              for (var d in obj['profits']) {
                if (obj['profits']['order'] === transactions[c]['details']['orderId']) obj['profits'].splice(d, 1)
              }
              transactions.splice(c, 1)
              return undefined
            })
          //console.log('order status', status)
          if (status) transactions[c]['details'] = status
        }
      }
    }

    var lastSell = await getLastSell()
    var lastBuy = await getLastBuy()

    var sold = false
    var bought = false

    if (transactions.length >= 1) {
      const transactionStatus = transactions[transactions.length - 1]['details']['status']
      const transactionType = transactions[transactions.length - 1]['type']
      if ((transactionStatus !== 'FILLED' && platform === 'Binance' && transactionStatus !== 'PARTIALLY_FILLED') || transactionStatus === 'pending') {
        console.log(`there are open orders from type ${transactionType}`)
        obj['transactions'] = transactions
        fs.writeFileSync(path, JSON.stringify(obj), {
          encoding: 'utf-8'
        })
        continue
      } else if (transactionType === 'buy' || (transactions[transactions.length - 1]['take_profit'] && transactionType === 'sell')) bought = true
      else sold = true
    } else {
      sold = null
      bought = null
    }

    var profit = 1
    var averageProfit = undefined
    //set corridor
    if (bought) {
      profit = -1 * (1 - price * 0.995 / lastBuy['price']) - 0.00075
      console.log(`profit ${Number(profit * 100).toFixed(2)} %`)
      if (!corridor['price']) {
        corridor['price'] = Number(lastBuy['price'])
        corridor['up'] = Number(corridor['price'] * 1.04)
        corridor['down'] = Number(corridor['price'] * 0.96)
      }
      if (price > corridor['price']) {
        corridor['price'] = Number(price)
        corridor['up'] = Number(corridor['price'] * 1.04)
        corridor['down'] = Number(corridor['price'] * 0.96)
        if (platform === 'Coinbase') corridor['down'] = Number(corridor['price'] * 0.98)
      }
      if (profit >= 0.03) corridor['down'] = Number(corridor['price'] * 0.985)
      else if (profit >= 0.02) corridor['down'] = Number(corridor['price'] * 0.98)
      else if (profit >= 0.01) corridor['down'] = Number(corridor['price'] * 0.97)
      //console.log(JSON.stringify(corridor, null, 2))
      //console.log('lastbuy price', lastBuy['price'], corridor['down'], corridor['price'], corridor)
      averageProfit = obj['profits'].map(item => Number(item['profit'])).reduce((a, b) => a + b, 0)
      console.log('averageProfit', averageProfit)
    }

    const balances = await cryptobot.getBalances()
      .catch(e => {
        console.log('failed getting balance', e)
        return undefined
      })
    if (!balances) continue
    var balance = await getBalance(balances)
    console.log('balance', balance)

    async function getBalance(object) {
      if (platform === 'Binance') {
        if (sold || !lastBuy) return Number(object[accounts[a]['buy']]['available'])
        else return Number(object[accounts[a]['sell']]['available'])
      } else if (platform === 'Coinbase') {
        if (sold || !lastBuy) {
          const currency = id.split('-')[1]
          const increment = Number(product['base_increment']).countDecimals()
          const amount = Number(object.find(item => item['currency'] === currency)['balance']).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + increment + '})?'))[0]
          return Number(amount)
        } else {
          const currency = id.split('-')[0]
          const increment = Number(product['quote_increment']).countDecimals()
          const amount = Number(object.find(item => item['currency'] === currency)['balance']).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + increment + '})?'))[0]
          return Number(amount)
        }
      }
    }

    const generalProfit = await calculateProfit()
    console.log('general Profit', generalProfit)

    if (generalProfit < 0.075 && accounts[a]['tradingEnabled']) {
      console.log('too much loss')
      if (!bought) continue
    }

    async function calculateProfit() {
      const profits = obj['profits']
      var number = 1
      for (var d in profits) {
        number = number * (1 + profits[d]['profit'])
      }
      return Number(number)
    }

    const factor = accounts[a]['factor'] || 1

    const object = {
      'eight': 8 * factor,
      'thirteen': 13 * factor,
      'twentyone': 21 * factor,
      'fiftyfive': 55 * factor
    }
    //console.log('upTrendPattern', upTrendPattern



    let data5min = await indicator.generate(5)

    console.log('lineMoving', data5min['lineMoving'])

    let data15min = await indicator.generate(15)

    //console.log(new Date(Number(data5min['origin']['time'])).toTimeString(), data5min)
    //console.log(history.length, array5min.length)
    //console.log('15min Hash',crypto.createHash('sha1').update(JSON.stringify(data15min['HeikinAshi'])).digest('hex'))
    //console.log(new Date(Number(data15min['origin']['time'])).toString())
    console.log(data15min)

    const rules = {
      'Binance #1': {
        'buy': [
          [
            sold || sold === null,
            //!lastSell['moving'] || data15min['fiftyfive'] >= lastSell['moving'] * (1 + zehntel) && data15min['fiftyfive'] <= lastSell['moving'] * (1 - zehntel)
          ],
          [
            data15min['close'] <= data15min['BollingerBands']['lower'],
          ]
        ],
        'sell': [
          [
            bought,
            data15min['close'] >= data15min['BollingerBands']['upper']
          ]
        ],
        'moving': false,
        'take_profit': [
          false
        ]
      }
    }

    const rule = rules[accounts[a]['portfolio']]
    var buyRuleNo = obj['buyRuleNo']
    var sellRuleNo = obj['sellRuleNo']

    console.log('buyRuleNo', buyRuleNo)
    console.log('sellRuleNo', sellRuleNo)
    console.log(rule)

    if (buyRuleNo > rule['buy'].length - 1) {
      //reset indicators
      buyRuleNo = 0
      sellRuleNo = 0
    }

    if ((rule['buy'][buyRuleNo].filter(item => item === true)).length === rule['buy'][buyRuleNo].length) {
      //console.log('buy rule', a, buyRuleNo)
      if (buyRuleNo === rule['buy'].length - 1) {
        isBuyNext = true
      } else {
        buyRuleNo++
      }
    }

    //console.log(rules[ruless[t]]['sell'][sellRuleNo].filter(item => item === true))
    //console.log((rules[ruless[t]]['sell'][sellRuleNo].filter(item => item === true)).length, rules[ruless[t]]['sell'][sellRuleNo].length, lineMoving15Min)
    var take_profit = (rule['take_profit'].filter(item => item === true)).length === rule['take_profit'].length && !obj['take_profit']
    //console.log('take_profit', (rule['take_profit'].filter(item => item === true)).length, rule['take_profit'].length)
    if ((rule['sell'][sellRuleNo].filter(item => item === true)).length === rule['sell'][sellRuleNo].length) {
      //console.log('sell rule', a, sellRuleNo)
      if (sellRuleNo === rule['sell'].length - 1) {
        isSellNext = true
      } else sellRuleNo++
    } else if (take_profit) {
      isSellNext = true
    }

    console.log('bought', bought)
    console.log('sold', sold)
    console.log('isSellnext', isSellNext)
    if (isBuyNext && (sold || sold === null) && !bought) {
      await fetch('http://boehler-trading.com/action?id=49327715-f043-4a36-8e3c-717e7677cde6', {
        method: 'POST',
        body: JSON.stringify({ "ticker": id, "exchange": platform.toUpperCase(), "action": "buy" })
      })
      if (platform === 'Binance') {
        if (!accounts[a]['tradingEnabled']) {
          transactions.push({
            timestamp: Number(new Date().getTime()),
            type: 'buy',
            price: price * 1.003,
            details: {
              status: 'FILLED',
              kind: 'DEMO'
            }
          })
        } else {
          const size = Number(balance / price * accounts[a]['size']).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + accounts[a]['decimals'] + '})?'))[0]
          console.log('bought', size)
          var buyResp = await cryptobot.buy(id, Number(size), Number(price * 1.003).toFixed(price.countDecimals()))
            .catch(e => {
              console.log('buy error')
              return undefined
            })
          if (!buyResp) continue
          else console.log(buyResp)
          transactions.push({
            timestamp: Number(new Date().getTime()),
            type: 'buy',
            price: price * 1.003,
            details: buyResp
          })
        }
      } else if (platform === 'Coinbase') {
        const increment = Number(product['base_increment']).countDecimals()
        const size = Number(balance / price * accounts[a]['size']).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + increment + '})?'))[0]
        console.log('bought', size)
        var buyResp = await cryptobot.buy(id, Number(size), Number(price * 1.003).toFixed(price.countDecimals()))
          .catch(e => {
            console.log('buy error', e)
            return undefined
          })
        if (!buyResp) continue
        else console.log(buyResp)
        transactions.push({
          timestamp: Number(new Date().getTime()),
          type: 'buy',
          price: price * 1.003,
          details: buyResp
        })
      }
      buyRuleNo = 0
      sellRuleNo = 0
      corridor = {}
    } else if (isSellNext && bought && !sold) {
      await fetch('http://boehler-trading.com/action?id=49327715-f043-4a36-8e3c-717e7677cde6', {
        method: 'POST',
        body: JSON.stringify({ "ticker": id, "exchange": platform.toUpperCase(), "action": "sell" })
      })
      if (platform === 'Binance') {
        if (!accounts[a]['tradingEnabled']) {
          var orderID = await rndString()
          var transactionObj = {
            timestamp: Number(new Date().getTime()),
            type: 'sell',
            price: price * 0.995,
            profit: profit,
            details: {
              id: orderID,
              status: 'FILLED',
              kind: 'DEMO'
            },
            moving: rule['moving']
          }
          if (take_profit) {
            transactionObj['take_profit'] = true
            obj['take_profit'] = true
          } else obj['take_profit'] = false
          transactions.push(transactionObj)
          var profitObj = {
            profit: profit,
            marginProfit: Number(profit) * 3,
            order: orderID,
            timestamp: new Date().getTime()
          }
          if (take_profit) profitObj['takeProfit'] = true
          obj['profits'].push(profitObj)
        } else {
          var size = Number(balance).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + accounts[a]['decimals'] + '})?'))[0]
          if (take_profit) size = Number(balance * 0.5).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + accounts[a]['decimals'] + '})?'))[0]
          console.log('sold', size)
          var sellResp = await cryptobot.sell(id, Number(size), Number(price * 0.995).toFixed(price.countDecimals()))
            .catch(e => {
              console.log('sell error', e)
              return undefined
            })
          if (!sellResp) continue
          else if (!sellResp['orderId']) {
            console.log(JSON.stringify(sellResp, null, 3))
            console.error('no order id found!')
            await cryptobot.sendDiscord({
              title: 'Error: no order ID!',
              description: JSON.stringify(sellResp),
              fields: []
            })
            continue
          }
          else console.log(sellResp)
          var transactionObj = {
            timestamp: Number(new Date().getTime()),
            type: 'sell',
            price: price * 0.995,
            profit: profit,
            details: sellResp,
            moving: rule['moving']
          }

          if (sellResp['status'] === 'FILLED') {
            await cryptobot.sendDiscord({
              title: `FILLED SELL ${id} on Binance`,
              description: '',
              fields: [{
                title: 'Profit',
                text: `${Number(profit * 100).toFixed(3)}%`
              },
              {
                title: 'General Profit',
                text: `${Number((generalProfit - 1) * 100).toFixed(3)}%`
              }
              ],
            })
          }

          if (take_profit) {
            transactionObj['take_profit'] = true
            obj['take_profit'] = true
          } else obj['take_profit'] = false
          transactions.push(transactionObj)
          var profitObj = {
            profit: profit,
            order: sellResp['orderId'],
            timestamp: new Date().getTime()
          }
          if (take_profit) profitObj['takeProfit'] = true
          obj['profits'].push(profitObj)
        }
      } else if (platform === 'Coinbase') {
        console.log('sold', Number(balance))
        var sellResp = await cryptobot.sell(id, Number(balance), Number(price * 0.995).toFixed(price.countDecimals()))
          .catch(e => {
            console.log('sell error', e)
            return undefined
          })
        if (!sellResp) continue
        else console.log(sellResp)
        transactions.push({
          timestamp: Number(new Date().getTime()),
          type: 'sell',
          price: price,
          profit: profit,
          details: sellResp,
          moving: rule['moving']
        })
        obj['profits'].push({
          profit: profit,
          order: sellResp['id'],
          timestamp: new Date().getTime()
        })
      }
      buyRuleNo = 0
      sellRuleNo = 0
      corridor = {}
    }

    obj['buyRuleNo'] = buyRuleNo
    obj['sellRuleNo'] = sellRuleNo
    obj['corridor'] = corridor
    obj['transactions'] = transactions

    fs.writeFileSync(path, JSON.stringify(obj), {
      encoding: 'utf-8'
    })
  }
  await sleep(1000)
  main()
}

setInterval(async () => {
  for (var g in accounts) {
    if (!accounts[g]['active']) continue
    const id = accounts[g]['tradingPair']
    const path = `./data/${id}-data.json`
    var obj = fs.readFileSync(path, 'utf-8')
    obj = JSON.parse(obj)

    const profits = obj['profits']
    async function calculateProfit() {
      var number = 1
      for (var d in profits) {
        number = number * (1 + profits[d]['profit'])
      }
      return Number(number - 1)
    }

    var numberMargin = 1
    for (var d in profits) {
      numberMargin = numberMargin * (1 + profits[d]['marginProfit'])
    }
    numberMargin = Number(numberMargin - 1)

    var timeframe = new Date()
    timeframe.setHours(timeframe.getHours() - 24)
    var embed = new Discord.MessageEmbed()
    embed.setTitle(`${id} DETAILS`)
    embed.addFields({
      name: `General Profit`,
      value: Number(await calculateProfit() * 100).toFixed(2)
    }, {
      name: 'Transaction count 24h',
      value: (obj['transactions'].filter(item => item['timestamp'] >= timeframe.getTime())).length
    }, {
      name: 'Margin Profit',
      value: Number(numberMargin * 100).toFixed(2)
    })
    embed.setColor('#00a6ff')
    await webhook.send(embed)
  }
}, 1000 * 60 * 30);

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
