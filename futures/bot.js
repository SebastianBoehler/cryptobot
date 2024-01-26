const io = require("socket.io-client");
const events = require('events');
let eventEmitter = new events.EventEmitter();
const Binance = require('node-binance-api');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const {
    getAllIndexTransactions,
    checkSchema,
    writeTransaction,
    getAllIndexes
} = require('../fileUtils');
Number.prototype.countDecimals = function () {
    //console.log('countDecimals',this.valueOf())
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    else if (this.toString().includes('1e')) return Number(this.toString().split('-')[1]);
    return this.toString().split(".")[1].length || 0;
};

let futurePrices = {}
let futureMarkPrices = {}

let binance = new Binance().options({
    APIKEY: '',
    APISECRET: '',
    reconnect: true
});
async function InitializeStreams() {
    binance.futuresMiniTickerStream(miniTicker => {
        for (var t in miniTicker) {
            futurePrices[miniTicker[t]['symbol']] = miniTicker[t]
        }
    })

    binance.futuresMarkPriceStream(miniTicker => {
        for (var t in miniTicker) {
            futureMarkPrices[miniTicker[t]['symbol']] = miniTicker[t]
        }
    })
}
InitializeStreams()

class Binancebot {
    constructor(client) {
        //this.id = id.replace('PERP', '')
        this.authedClient = new Binance().options({
            APIKEY: client['key'],
            APISECRET: client['secret']
        });
    };

    async setTicker(id) {
        this.id = id.replace('PERP', '')
        this.ticker = id
    };

    async productDetails() {
        return new Promise(async (resolve, reject) => {
            fetch('https://api.binance.com/api/v3/exchangeInfo')
                .then(async resp => {
                    const data = await resp.json()
                    let details = data['symbols'].filter(item => item['symbol'] === this.id)
                    resolve(details[0])
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    };

    async getBalances() {
        let resp = await this.authedClient.futuresBalance()
        return JSON.parse(JSON.stringify(resp))
    };

    async buy(quantity, price) {
        return new Promise(async (resolve, reject) => {
            console.log('buying with', parseFloat(quantity))
            let resp = await this.authedClient.futuresBuy(this.id, quantity, price)
            resp = JSON.parse(JSON.stringify(resp))
            resolve(resp)
        })
    };

    async marketBuy(quantity, params) {
        //if (webhook) webhook.send(`market sell ${this.id}`)
        log.warn('market Buy', this.id)
        if (quantity <= 0) {
            console.log(quantity)
            //reject('cant trade with negative balance!')
            return
        }
        return new Promise(async (resolve, reject) => {
            console.log('buying with', parseFloat(quantity))
            let param = {
                newOrderRespType: 'RESULT'
            }

            for (var t in params) {
                param[t] = params[t]
            }
            log.log('using params', param)
            let resp = await this.authedClient.futuresMarketBuy(this.id, quantity, param)
            resp = JSON.parse(JSON.stringify(resp))
            //console.log(resp)
            if (resp['code']) {
                BinanceLog.error(resp, quantity, params)
                reject(resp)
                return
            } //else BinanceLog.info(resp)
            if (!params || params['type'] !== 'STOP_MARKET') clientOrderId = resp['clientOrderId'] || undefined
            //BinanceLog.error('test', this.clientOrderId)
            resolve(resp)
        })
    };

    async sell(quantity, price) {
        return new Promise(async (resolve, reject) => {
            console.log('selling with', parseFloat(quantity))
            let resp = await this.authedClient.futuresSell(this.id, quantity, price)
            resp = JSON.parse(JSON.stringify(resp))
            resolve(resp)
        })
    };

    async marketSell(quantity, params) {
        //if (webhook) webhook.send(`market sell ${this.id}`)
        log.warn('market sell', this.id)
        if (quantity <= 0) {
            console.log(quantity)
            //reject('cant trade with negative balance!')
            return
        }
        return new Promise(async (resolve, reject) => {
            console.log('selling with', parseFloat(quantity))
            let param = {
                newOrderRespType: 'RESULT'
            }
            for (var t in params) {
                param[t] = params[t]
            }
            log.log('using params', param)
            let resp = await this.authedClient.futuresMarketSell(this.id, quantity, param)
            resp = JSON.parse(JSON.stringify(resp))
            //console.log(resp)
            if (resp['code']) {
                BinanceLog.error(resp, quantity, params)
                reject(resp)
                return
            } //else BinanceLog.info(resp)
            if (!params || params['type'] !== 'STOP_MARKET') clientOrderId = resp['clientOrderId'] || undefined
            //BinanceLog.error('test', clientOrderId)
            resolve(resp)
        })
    };

    async futuresCancel(id) {
        log.info('cancel order', this.id, id)
        let resp = await this.authedClient.futuresCancel(this.id, {
            origClientOrderId: id
        })
        return resp
    }

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
        if (data['status'] === 'DEMO' || !webhook) return
        //https://discord.com/api/webhooks/776017258564157442/TID_qcqYUROzy2na7a0c3t2odTAe4n705OxReV-MzPgQBf5kFVQOF100c6eaMPDTcPw8
        let price = parseFloat(data['price']) === 0 ? parseFloat(data['avgPrice']) : parseFloat(data['price'])
        var embed = new Discord.MessageEmbed()
        embed.setTitle(`${data['action']} ${data['symbol']}`)
        embed.setDescription(`"${data['status']}" ${data['type']} order at ${new Date(data['time']).toLocaleTimeString()}`)
        embed.addField('Position', `${data['executedQty']} @ ${price}`, true)
        //embed.addField('Leverage', data['leverage'], true)
        if (data['leverageProfit']) {
            embed.addField('Realized Profit', `${Number(data['leverageProfit']).toFixed(2)}%`, true)
        }
        embed.addField('Balance', Number(data['balance']['balance']).toFixed(2), true)
        embed.addField('Details', data['message'] || 'Other Source', true)
        embed.addField('Quote', Number(data['quote']).toFixed(2))
        embed.addField('Order ID', data['clientOrderId'])
        if (data['leverageProfit']) embed.setColor(data['leverageProfit'] >= 0 ? '#03fc03' : '#fc0303')
        if (data['msg']) embed.addField('Error msg', data['msg'])
        await webhook.send(embed)

    };

    async sendDiscord(data) {
        var embed = new Discord.MessageEmbed()
        embed.setTitle(data['title'])
        embed.setDescription(data['description'])
        for (var a in data['fields']) {
            if (data['fields'][a]['title'] === 'Profit') {
                if (parseFloat(data['fields'][a]['text']) > 0) embed.setColor('#00cc25')
                else embed.setColor('#cc0000')
            }
            embed.addField(data['fields'][a]['title'], data['fields'][a]['text'], true)
        }
        await webhook.send(embed)
    };

    async futuresPrice(symbol) {
        return new Promise(async (resolve, reject) => {
            //console.log(futurePrices)
            let result = futurePrices[symbol]
            if (!result) {
                resolve(undefined)
                return
            }
            //console.log('get futures price', result)
            resolve(parseFloat(result['close']))
            //resolve(parseFloat(JSON.parse(JSON.stringify(result))['close']))
        })
    };

    async futuresMarkPrice(symbol) {
        let result = futureMarkPrices[symbol]
        if (!result) return undefined
        return parseFloat(result['markPrice'])
    };

    async adjustLeverage(leverage) {
        this.leverage = leverage
        await this.authedClient.futuresMarginType(this.id, 'CROSSED')
        let resp = await this.authedClient.futuresLeverage(this.id, leverage)
        resp = JSON.parse(JSON.stringify(resp))
        //console.log(resp)
        return resp
    };

    async futurePositions() {
        let resp = await this.authedClient.futuresAccount()
        resp = JSON.parse(JSON.stringify(resp))
        //console.log(resp)
        return resp
    };

    async futuresExchangeInfo() {
        return (await this.authedClient.futuresExchangeInfo())['symbols']
    };

    async futuresOrderStatus(symbol, id) {
        let order = await this.authedClient.futuresOrderStatus(symbol, {
            orderId: id
        })
        order = JSON.parse(JSON.stringify(order))

        if (order['code'] && order['code'] === -2013) {
            await sleep(350)
            log.error('FuturesOrderStatus error, retrying', order['msg'] || order['code'], id)
            order = await this.authedClient.futuresOrderStatus(symbol, {
                orderId: id
            })
            order = JSON.parse(JSON.stringify(order))
        }

        if (order['cumQuote']) order['quote'] = parseFloat(order['cumQuote']) / this.leverage
        return order
    };

    async futuresPositionRisk(symbol) {
        return (await this.authedClient.futuresPositionRisk()).find(item => item['symbol'] === symbol)
    };

    async futuresDepth(symbol) {
        return await this.authedClient.futuresDepth(symbol)
    };

    async useServerTime() {
        await this.authedClient.useServerTime();
    };

    async accountStream() {
        if (listenKey && !requestingKey) return
        requestingKey = true
        console.log('init account stream')
        let raw = await this.authedClient.futuresGetDataStream()
            .catch(e => {
                //onsole.log(e.message)
                return e
            })

        if (raw.message) {
            console.log('catched error api')
            //log.error(raw)
            return
        }
        raw = JSON.parse(JSON.stringify(raw))
        if (raw['code']) {
            //TODO notify user
            log.error(raw)
            await sleep(500)
            this.accountStream()
            return
        }
        this.key = raw['listenKey']
        //else this.key = listenKey
        //console.log('stream key', this.key, listenKey)
        if (this.key) {
            listenKey = this.key
            await this.authedClient.futuresSubscribe(this.key, handleStreamData, true);
        } else {
            this.accountStream()
            return
        }

        requestingKey = false
        //BinanceLog.info('subscriptions', await this.authedClient.futuresSubscriptions())
    };

    async unsubscribeStream(key) {
        this.authedClient.futuresTerminate(key || this.key);
    };

    async deleteUserTream() {
        this.authedClient.futuresCloseDataStream()
    };

    async tradeFee(symbol) {
        let fees = JSON.parse(JSON.stringify(await this.authedClient.tradeFee()))
        fees = fees['tradeFee']

        if (fees) {
            return fees.find(item => item['symbol'] === symbol)['taker']
        } else return 0.001
    };

    async commissionFee() {
        console.log(this.id)
        let data = await this.authedClient.futuresCommissionRate(this.id)
        return data
        console.log('inside comission fee', this.id)
        let comission = JSON.parse(JSON.stringify(await this.authedClient.futuresCommissionRate(this.id)))
        return comission
    };

    async futuresTradingStatus() {
        let status = JSON.parse(JSON.stringify(await this.authedClient.futuresTradingStatus()))
        return status
    };

    async fundingRate(symbol) {
        let data = await this.authedClient.futuresMarkPrice(symbol)
        data = JSON.parse(JSON.stringify(data))

        return data
    };

    async futuresCloseDataStream() {
        await this.authedClient.futuresCloseDataStream()
    };

    async futuresKeepDataStream() {
        let data = await this.authedClient.futuresKeepDataStream()
        StreamLog.log('keepAlive resp', data)
    };

    async getDepth(id, action) {
        let depth = await this.authedClient.futuresDepth(id)
        depth = JSON.parse(JSON.stringify(depth))

        let price = await this.futuresMarkPrice(id)
        let volume = 0

        depth[action.includes('Short') ? 'asks' : 'bids'].map(item => {
            if (item[0] <= price * 1.0005) {
                //console.log(+item[0] * +item[1])
                volume += +item[0] * +item[1]
            }
        })
        console.log(volume)

        return volume
    };
};

let clients = [{
    key: '',
    secret: '',
    platform: 'BINANCE',
    id: 'test',
    bot: new Binancebot('', ''),
    validCredentials: false
}]

const socket = io("ws://boehler-trading.com:8080");

socket.on('connected', async (data) => {
    console.log('connected')
    await checkSchema('test')
    checkPositions()
    socket.emit('roomSelect', {
        room: 'live' //live / demo / all / {symbol}
    });

    socket.emit('roomSelect', {
        room: 'demo' //live / demo / all / {symbol}
    });
});

socket.on('signal', async (data) => {
    //console.log(data['ticker'], data['action'])
    eventEmitter.emit('signal', data);
});

socket.on('setCredentialsForTrader', async (data) => {
    //find id in clients / test credentials and overwrite
})

socket.on('rooms', async (data) => {
    //console.log(data)
});

socket.io.on("error", (error) => {
    console.error('socket error', error)
});

eventEmitter.on('signal', async (data) => {

    for (var a in clients) {
        let client = clients[a]
        let transactions = await getAllIndexTransactions(client['id'], +data['index'] || undefined)
            .catch(e => {
                console.log(e)
                return undefined
            })
        if (!transactions) return
        let latestTransaction = transactions[transactions.length - 1]
        //console.log('eventEmitter', data['ticker'], data['action'], transactions.length)

        if (data['action'].includes('Entry')) {
            if (!latestTransaction || latestTransaction['action'].includes('Exit')) {
                //execute Entry
                if (client['platform'] === data['exchange']) eventEmitter.emit('executeOrder', data, client, transactions);
            }
        } else if (data['action'].includes('Exit')) {
            if (latestTransaction && latestTransaction['action'].includes('Entry')) {
                let trxType = latestTransaction['action'].split(' ')[0]
                let actionType = data['action'].split(' ')[0]
                if (trxType !== actionType) return
                if (client['platform'] === data['exchange']) eventEmitter.emit('executeOrder', data, client, transactions);
            }
        }
    }
})

eventEmitter.on('executeOrder', async (data, client, transactions) => {
    let symbol = data['ticker'].replace('PERP', '')
    let invest = 50
    let leverage = 5
    let latestTransaction = transactions[transactions.length - 1]
    if (data['exchange'] === 'BINANCE') {
        let myBinance = new Binancebot(client)
        await myBinance.setTicker(data['ticker'])

        console.log('binance singal', data['action'])

        if (data['mode'] === 'DEMO') {
            //DEMO
            let markPrice = await myBinance.futuresMarkPrice(symbol)
            if (isNaN(markPrice)) return
            console.log('markPrice', markPrice, data['ticker'], data['action'], data['message'])

            let object
            if (data['action'] === 'Short Entry' || data['action'] === 'Long Entry') {
                object = {
                    symbol: symbol,
                    orderId: await rndString(),
                    status: 'DEMO',
                    price: '0',
                    avgPrice: markPrice,
                    executedQty: '0.01',
                    type: 'DEMO',
                    leverage: leverage,
                    action: data['action'],
                    message: data['message'],
                    time: new Date().getTime(),
                    base_amount: latestTransaction ? +latestTransaction['base_amount'] : invest
                }
            } else if (data['action'] === 'Long Exit') {
                let difference = (new Date().getTime() - +latestTransaction['time']) / 1000 / 60
                let entryPrice = +latestTransaction['price'] === 0 ? +latestTransaction['avgPrice'] : +latestTransaction['price']
                object = {
                    symbol: symbol,
                    orderId: await rndString(),
                    status: 'DEMO',
                    price: '0',
                    avgPrice: markPrice,
                    executedQty: '0.01',
                    type: 'DEMO',
                    leverage: leverage,
                    action: data['action'],
                    message: data['message'],
                    profit: Number((markPrice / entryPrice - 1) * 100 - (0.0004 * 2 * leverage)),
                    leverageProfit: Number(((markPrice / entryPrice - 1) * 100 * leverage - (0.0004 * 2 * leverage))),
                    //leverageProfit2: Number(((markPrice / entryPrice - 1 - (0.0004 * 2 * leverage)) * 100 * -1 * leverage)),
                    time: new Date().getTime(),
                    holdDuration: Number(difference).toFixed(2),
                    entryId: latestTransaction['orderId'],
                    entrySymbol: latestTransaction['symbol'],
                }

                object['base_amount'] = +latestTransaction['base_amount'] * (object['leverageProfit'] / 100 + 1)
                object['base_amount info'] = `${+latestTransaction['base_amount']} ${(object['leverageProfit'] / 100 + 1)} ${object['leverageProfit']}`
            } else if (data['action'] === 'Short Exit') {
                let difference = (new Date().getTime() - +latestTransaction['time']) / 1000 / 60
                let entryPrice = +latestTransaction['price'] === 0 ? +latestTransaction['avgPrice'] : +latestTransaction['price']
                object = {
                    symbol: symbol,
                    orderId: await rndString(),
                    status: 'DEMO',
                    price: '0',
                    avgPrice: markPrice,
                    executedQty: '0.01',
                    type: 'DEMO',
                    leverage: leverage,
                    action: data['action'],
                    message: data['message'],
                    profit: Number((markPrice / entryPrice - 1) * 100 * -1 - (0.0004 * 2 * leverage)),
                    leverageProfit: Number(((markPrice / entryPrice - 1) * 100 * -1 * leverage - (0.0004 * 2 * leverage))),
                    time: new Date().getTime(),
                    holdDuration: Number(difference).toFixed(2),
                    entryId: latestTransaction['orderId'],
                    entrySymbol: latestTransaction['symbol'],
                }

                object['base_amount'] = +latestTransaction['base_amount'] * (object['leverageProfit'] / 100 + 1)
                object['base_amount info'] = `${+latestTransaction['base_amount']} ${(object['leverageProfit'] / 100 + 1)} ${object['leverageProfit']}`
            }

            if (!object) return
            object['markPrice'] = markPrice
            object['details'] = data['details']
            object['index'] = data['index']
            object['timestamp'] = new Date().toLocaleString()
            object['rule'] = data['rule']
            object['leverage'] = leverage
            object['message'] = data['message']
            object['action'] = data['action']
            object['platform'] = data['exchange']

            await writeTransaction(client['id'], object)
        } else if (data['mode'] === 'live' && client['validCredentials']) {
            let adjustLeverage = await myBinance.adjustLeverage(leverage)
                .catch(e => {
                    console.log('adjust leverage error', e)
                    return undefined
                })
            if (!adjustLeverage || adjustLeverage.name) {
                console.log('adjust leverage error')
                return
            }

            let details = await myBinance.futuresExchangeInfo()
                .catch(e => {
                    console.error('futures exchange Info error', e)
                    return undefined
                })

            if (!details || details.name) {
                console.error('futures exchange Info error')
                return
            }
            let symbolDetails = details.find(item => item['symbol'] === symbol)
            let decimals = symbolDetails['filters'][1]['minQty']

            let balance = await myBinance.getBalances()
                .catch(e => {
                    console.log('balance error', e)
                    return undefined
                })
            if (!balance || balance['msg']) {
                console.error('balance error')
                return
            }
            let tickerBalance = balance.find(item => data['ticker'].includes(item['asset']))
            let markPrice = await myBinance.futuresMarkPrice(symbol)

            if (isNaN(markPrice) || !markPrice) {
                console.error('Seems like price streams disconnected!')
                return
            }

            //request initamount TODO
            let InitAmount
            let invest = InitAmount || 15
            if (invest >= tickerBalance['availableBalance'] && data['action'].includes('Entry')) {
                console.error('please adjust start amount! cant be greater than balance')
                return
            }
            let amount = invest / markPrice * leverage
            amount = Number(amount).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(decimals).countDecimals() + '})?'))[0]
            if (latestTransaction && latestTransaction['base_amount']) {
                //log.log('using base amount for calculation', latestTransaction['base_amount'])
                amount = (+latestTransaction['base_amount']) / markPrice * leverage
                //console.log(latestTransaction['baseAmount'], amount)
                amount = Number(amount).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(decimals).countDecimals() + '})?'))[0]
                //console.log(Number(amount).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(decimals).countDecimals() + '})?')))
            } else {
                console.error('no latest base amount')
                return
            }

            let object
            if (data['action'] === 'Long Entry') {
                let resp = await myBinance.marketBuy(amount)
                    .catch(e => {
                        console.log(e)
                        return undefined
                    })
                if (!resp) {
                    console.error('long entry error')
                    return
                }
                await sleep(150)
                resp = await myBot.futuresOrderStatus(data['ticker'].replace('PERP', ''), resp['orderId'])
                if (resp['msg'] === 'Order does not exist.') {
                    console.error('Order does not exist.')
                    return
                }

                let stopPrice = Number(markPrice * (1 - stopOrderPercentage)).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(symbolDetails['pricePrecision']) + '})?'))[0]
                let stopOrder = await myBinance.marketSell(amount, {
                    stopPrice: +stopPrice,
                    type: 'STOP_MARKET',
                    workingType: 'MARK_PRICE',
                    reduceOnly: true
                })

                if (stopOrder) {
                    resp['stopOrderId'] = stopOrder['clientOrderId']
                    resp['stopOrderPrice'] = stopOrder['stopPrice']
                }
                resp['base_amount'] = latestTransaction ? +latestTransaction['base_amount'] : invest
                object = resp
            } else if (data['action'] === 'Short Entry') {
                let resp = await myBinance.marketSell(amount)
                    .catch(e => {
                        console.log(e)
                        return undefined
                    })
                if (!resp) {
                    console.error('short entry error')
                    return
                }
                await sleep(150)
                resp = await myBot.futuresOrderStatus(data['ticker'].replace('PERP', ''), resp['orderId'])
                if (resp['msg'] === 'Order does not exist.') {
                    console.error('Order does not exist.')
                    return
                }

                let stopPrice = Number(markPrice * (1 + stopOrderPercentage)).toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + Number(symbolDetails['pricePrecision']) + '})?'))[0]
                let stopOrder = await myBinance.marketBuy(amount, {
                    stopPrice: +stopPrice,
                    type: 'STOP_MARKET',
                    workingType: 'MARK_PRICE',
                    reduceOnly: true
                })

                if (stopOrder) {
                    resp['stopOrderId'] = stopOrder['clientOrderId']
                    resp['stopOrderPrice'] = stopOrder['stopPrice']
                }
                resp['base_amount'] = latestTransaction ? +latestTransaction['base_amount'] : invest
                object = resp
            }

            if (!object) {
                console.error('no object found')
                return
            }
            object['markPrice'] = markPrice
            object['details'] = data['details']
            object['index'] = data['index']
            object['timestamp'] = new Date().toLocaleString()
            object['rule'] = data['rule']
            object['leverage'] = leverage
            object['message'] = data['message']
            object['action'] = data['action']
            object['platform'] = data['exchange']

            await writeTransaction(client['id'], object)
        }
    }
})

async function checkPositions() {
    console.log('\n----------check positions----------')
    let takeProfitThreshold = 0.49
    let stopLossThreshold = -0.99
    let timeoutMins = 40
    let takeProfitMins = 15
    for (var a in clients) {
        let client = clients[a]
        let indexes = await getAllIndexes(client['id'])
        indexes = [...new Set(indexes)]

        for (var b in indexes) {
            let index = indexes[b]
            let transactions = await getAllIndexTransactions(client['id'], index)
            let latestTransaction = transactions[transactions.length - 1]

            if (latestTransaction['action'].includes('Exit')) continue
            if (latestTransaction['action'].includes('Entry')) {
                //console.log('transactions', transactions.length)

                let entryPrice = +latestTransaction['price'] === 0 ? +latestTransaction['avgPrice'] : +latestTransaction['price']
                let platform = latestTransaction['platform']
                let symbol = latestTransaction['symbol']
                let difference = (new Date().getTime() - +latestTransaction['time']) / 1000 / 60

                if (platform === 'BINANCE') {
                    let myBinance = new Binancebot(client)
                    let markPrice = await myBinance.futuresMarkPrice(symbol)
                    if (isNaN(markPrice)) continue
                    let profit = (markPrice / entryPrice - 1) * 100
                    if (latestTransaction['action'].includes('Short')) profit = profit * -1
                    console.log(`open position: ${symbol} ${index} @ ${profit.toFixed(3)} & ${await calculateProfit()} ${latestTransaction['rule']} ${difference}`)


                    //DEMO
                    if (latestTransaction['status'] === 'DEMO') {
                        if (profit >= takeProfitThreshold || (difference >= takeProfitMins && profit >= 0.1 && index !== 18)) {
                            //console.log('execute order')
                            eventEmitter.emit('executeOrder', {
                                ticker: symbol + 'PERP',
                                exchange: 'BINANCE',
                                action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                close: markPrice,
                                message: `Take Profit`,
                                id: client['id'],
                                index: index,
                                mode: 'DEMO'
                            }, client, transactions)
                        } else if (profit <= stopLossThreshold) {
                            //console.log('execute order')
                            eventEmitter.emit('executeOrder', {
                                ticker: symbol + 'PERP',
                                exchange: 'BINANCE',
                                action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                close: markPrice,
                                message: `Stop Loss`,
                                id: client['id'],
                                index: index,
                                mode: 'DEMO'
                            }, client, transactions)
                        } else if (difference >= timeoutMins && index !== 18) {
                            eventEmitter.emit('executeOrder', {
                                ticker: symbol + 'PERP',
                                exchange: 'BINANCE',
                                action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                close: markPrice,
                                message: `Time Limit`,
                                id: client['id'],
                                index: index,
                                mode: 'DEMO'
                            }, client, transactions)
                        }
                    } else if (latestTransaction['status'] === 'live') {
                        //live transactions
                        let position = await myBinance.futuresPositionRisk(symbol)
                            .catch(e => {
                                console.log(e.message)
                                return undefined
                            })
                        if (!position) {
                            console.warn('couldnt retrive open positions from broker')
                            continue
                        } else {
                            if ((+position['positionAmt'] === 0)) {
                                console.error('Position amount is zero!')
                                continue
                            }
                            let liqPrice = +position['liquidationPrice']
                            console.log('liquidationPrice', liqPrice)
                            let type = latestTransaction['action'].includes('Short') ? 'Short' : 'Long'

                            if (((type === 'Short' && price >= liqPrice * 0.95) || (type === 'Long' && price <= liqPrice * 1.05)) && liqPrice !== 0) {
                                //liquidation
                                console.warn('liquidation!', liqPrice, markPrice)
                                eventEmitter.emit('executeOrder', {
                                    ticker: symbol + 'PERP',
                                    exchange: 'BINANCE',
                                    action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                    close: markPrice,
                                    message: `Prevent liquidation @ ${liqPrice}`,
                                    id: client['id'],
                                    index: index,
                                    mode: 'live'
                                }, client, transactions)
                            } else if (profit >= takeProfitThreshold || (difference >= takeProfitMins && profit >= 0.1)) {
                                eventEmitter.emit('executeOrder', {
                                    ticker: symbol + 'PERP',
                                    exchange: 'BINANCE',
                                    action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                    close: markPrice,
                                    message: `Take Profit`,
                                    id: client['id'],
                                    index: index,
                                    mode: 'live'
                                }, client, transactions)
                            } else if (profit <= stopLossThreshold) {
                                //console.log('execute order')
                                eventEmitter.emit('executeOrder', {
                                    ticker: symbol + 'PERP',
                                    exchange: 'BINANCE',
                                    action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                    close: markPrice,
                                    message: `Stop Loss`,
                                    id: client['id'],
                                    index: index,
                                    mode: 'live'
                                }, client, transactions)
                            } else if (difference >= timeoutMins) {
                                eventEmitter.emit('executeOrder', {
                                    ticker: symbol + 'PERP',
                                    exchange: 'BINANCE',
                                    action: latestTransaction['action'] === 'Short Entry' ? 'Short Exit' : 'Long Exit',
                                    close: markPrice,
                                    message: `Time Limit`,
                                    id: client['id'],
                                    index: index,
                                    mode: 'live'
                                }, client, transactions)
                            }
                        }
                    }
                }
            }

            async function calculateProfit() {
                let profits = transactions.filter(item => item['action'].includes('Exit'))
                //console.log(profits)
                profits = profits.map(item => item['net_profit_percentage'] * 100 || item['absolut_precentage'] || item['leverageProfit'])
                //console.log('profits', profits)
                var number = 1
                for (var d in profits) {
                    number = number * (1 + profits[d] / 100)
                }
                //console.log(number)
                return +Number((number - 1) * 100).toFixed(3)
            }
        }
    }

    setTimeout(() => {
        checkPositions()
    }, 1000 * 10);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

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

};