var {
    generateIndicators
} = require('./indicators');
var fs = require('fs');
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();
const fileUtils = require('./fileUtils');
const fetch = require('node-fetch');
const technicalIndicators = require('technicalindicators');
const crypto = require('crypto')

var platform = process.argv[2]

if (!platform) platform = 'coinbase'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function returnValues(array, time) {
    array = array.filter(item => Number(item['time']) <= time)
    var data = array[array.length - 1]
    //console.log(data)
    data['difference'] = Number(data['eight'] / data['fiftyfive']).toFixed(3)

    var lineArray = array.map(item => Number(item['fiftyfive']))
    lineArray = lineArray.slice(lineArray.length - 5, lineArray.length)
    const lineMove = await lineMoving()
    var lineTrend = 0

    //console.log(lineMove['count'], lineMove['length'], lineArray)

    if (lineMove['count'] >= lineMove['length'] * 0.75) lineTrend = 1
    else if (lineMove['count'] <= lineMove['length'] * 0.5) lineTrend = -1

    data['lineMoving'] = lineTrend
    //console.log(data['BB'][0])

    //console.log('data',JSON.stringify(data, null, 2))

    return data

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
}

async function testRule(id) {
    var indcators = [
        //'SMA',
        'EMA',
        //'WMA'
    ]
    var ruless = [
        '5'
    ]

    var factor = 1

    var obj = {}

    var history = await fileUtils.loadData(id, platform.toUpperCase())
        .catch(e => {
            return undefined
        })

    if (!history || history.length < 500) {
        return
    }

    //new strategies
    history = history.filter(item => item['open'] !== '')

    //console.log(id)
    //const start = history[500]['time'] || undefined
    //const end = history[history.length - 1]['time'] || undefined
    //parentPort.postMessage('loaded history' + JSON.stringify(history[0]))

    //console.log('since', new Date(Number(history[0]['time'])).toString())
    for (var t in ruless) {
        //if (t > 0) continue
        //console.log(ruless[t])
        //if (ruless[t] === '15.3' || ruless[t] === '15.2' || ruless[t] === '5') factor = 2
        //else factor = 1
        for (var d in indcators) {
            //if (d > 0) continue
            //console.log(ruless[t], indcators[d])
            const indicator = indcators[d]
            var sold = null
            var bought = false
            var profits = []
            var transactions = []
            var averageProfit = 0

            if (!obj[indicator]) obj[indicator] = {}

            async function getLastSell() {
                var sell = {}
                var sells = transactions.filter(item => item['type'] === 'sell')
                if (sells.length >= 1) sell = sells[sells.length - 1]
                return sell
            }

            async function getLastBuy() {
                var buy = {}
                var buys = transactions.filter(item => item['type'] === 'buy')
                if (buys.length >= 1) buy = buys[buys.length - 1]
                return buy
            }

            var corridor = {}

            let isLongEntry = false
            let isLongExit = false
            let isShortEntry = false
            let isLongEntry = false
            var buyRuleNo = 0
            var sellRuleNo = 0

            const object = {
                'eight': parseInt(8 * factor),
                'thirteen': parseInt(13 * factor),
                'twentyone': parseInt(21 * factor),
                'fiftyfive': parseInt(55 * factor)
            }

            //console.log(object)

            var timeframe = new Date()
            timeframe.setHours(timeframe.getHours() - 24 * 3)

            //invalid calculation
            const max = Math.max(...history.filter(item => Number(item['time']) >= timeframe.getTime()).map(item => Number(item['price'])))
            const min = Math.min(...history.filter(item => Number(item['time']) >= timeframe.getTime()).map(item => Number(item['price'])))
            const difference = max / min
            const zehntel = (difference - 1) * 0.1

            //console.log(crypto.createHash('sha1').update(JSON.stringify(history)).digest('hex'))

            var {
                array: array1min
            } = await generateIndicators(indicator, 1, history, true, object);
            array1min = array1min.filter(item => item['fiftyfive'] !== undefined)
            var {
                array: array5min
            } = await generateIndicators(indicator, 5, history, true, object);
            array5min = array5min.filter(item => item['fiftyfive'] !== undefined)
            var {
                array: array15min
            } = await generateIndicators(indicator, 15, history, true, object);
            array15min = array15min.filter(item => item['fiftyfive'] !== undefined)
            var {
                array: array25min
            } = await generateIndicators(indicator, 25, history, true, object);
            array25min = array25min.filter(item => item['fiftyfive'] !== undefined)

            //fs.writeFileSync(`./${id}_origin_array.json`, JSON.stringify(array15min.slice(array15min.length - 16, array15min.length - 1), null, 3), { encoding: 'utf-8' })


            var testingFrame = new Date()
            testingFrame.setHours(testingFrame.getHours() - 60 * 24 * 14)
            array1min = array1min.filter(item => Number(item['time']) >= testingFrame.getTime()) 

            try {
                array1min = array1min.filter(item => Number(item['time']) >= Number(array25min[0]['time'])) 
            } catch (error) {
                console.log(error)
                continue
            }
            console.log('since', new Date(Number(array1min[0]['time'])).toLocaleString(), ruless[t], history[0]['id'])

            for (var a = 25; a < array1min.length; a = a + 1) {
                //console.log(a)
                const time = Number(array1min[a]['time'])
                let data1min = array1min[a]
                //console.log(time)
                const price = Number(array1min[a]['price'])

                if (!time) {
                    console.log('continue', history[a])
                    continue
                }


                var lastSell = await getLastSell()
                var lastBuy = await getLastBuy()

                var profit = undefined
                if (transactions.length >= 1 && transactions[transactions.length - 1]['type'] === 'buy') profit = Number(-1 * (1 - price * 0.997 / Number(transactions[transactions.length - 1]['price'])) - 0.00075)

                //if (profit) console.log(profit)

                //console.log(lastSell)

                //if (bought) console.log(price <= corridor['down'] || price >= corridor['up'])


                averageProfit = 0
                for (var c in profits) {
                    //console.log(profits[c])
                    if (Number(profits[c]) > 0) averageProfit = Number(averageProfit) + Number(profits[c]['profit'])
                    //else console.log('ubbala')
                }
                if (profits.length > 0) averageProfit = averageProfit / profits.length
                else averageProfit = 1
                //console.log(averageProfit, profits.length)

                if (bought) {
                    if (!corridor['price']) {
                        corridor['price'] = Number(lastBuy['price'])
                        corridor['up'] = Number(corridor['price'] * 1.05)
                        corridor['down'] = Number(corridor['price'] * 0.96)
                    }
                    else if (price > corridor['price']) {
                        corridor['price'] = Number(price)
                        corridor['up'] = Number(corridor['price'] * 1.04)
                        corridor['down'] = Number(corridor['price'] * 0.97)
                        if (profit >= 0.015 || (profit >= averageProfit && averageProfit != 0)) corridor['down'] = Number(corridor['price'] * 0.98)
                        //console.log(profit)
                    }
                    //console.log(JSON.stringify(corridor, null, 2))
                }
                //if (sold) console.log('averageProfit',averageProfit)
                //parentPort.postMessage(a)
                //const price = Number(array1min[a]['price'])

                var data5min = await returnValues(array5min, time)

                var data15min = await returnValues(array15min, time)

                var data25min = await returnValues(array25min, time)

                //console.log(lineMoving1Min, lineMoving5Min)
                //if (lastSell) console.log(typeof price, typeof lastSell['moving'],!(price < lastSell['moving'] * 1.006 && price > lastSell['moving'] * 0.994))
                console.log(data5min['AO'])
                //console.log('lastsell', lastSell)

                const rules = {
                    '5': {
                        'short': {
                            'entry': [],
                            'exit': []
                        },
                        'long': {
                            'entry': [],
                            'exit': []
                        },
                        'moving': false,
                    }
                }
                

                if ((rules[ruless[t]]['buy'][buyRuleNo].filter(item => item === true)).length === rules[ruless[t]]['buy'][buyRuleNo].length) {
                    //console.log('buy rule', a, buyRuleNo)
                    if (buyRuleNo === rules[ruless[t]]['buy'].length - 1) {
                        isBuyNext = true
                    } else {
                        buyRuleNo++
                    }
                }

                //console.log(rules[ruless[t]]['sell'][sellRuleNo].filter(item => item === true))
                //console.log((rules[ruless[t]]['sell'][sellRuleNo].filter(item => item === true)).length, rules[ruless[t]]['sell'][sellRuleNo].length, lineMoving15Min)
                if ((rules[ruless[t]]['sell'][sellRuleNo].filter(item => item === true)).length === rules[ruless[t]]['sell'][sellRuleNo].length) {
                    //console.log('sell rule', a, sellRuleNo)
                    if (sellRuleNo === rules[ruless[t]]['sell'].length - 1) {
                        isSellNext = true
                    } else sellRuleNo++
                }

                //console.log(buyRuleNo, isBuyNext)

                //console.log('isBuyNext', isBuyNext, bought)
                //console.log('isSellNext', isSellNext, sold)

                if (isBuyNext && (sold || sold === null) && !bought) {
                    //console.log('bought', a)
                    transactions.push({
                        timestamp: new Date(time).getTime(),
                        time: new Date(time).toLocaleString(),
                        price: Number(price * 1.003),
                        type: 'buy',
                        rule: ruless[t],
                    })
                    bought = true
                    sold = false
                    sellRuleNo = 0
                    buyRuleNo = 0
                    isSellNext = false
                    isBuyNext = false
                } else if ((isSellNext && bought) || (bought && a > array1min.length - 5)) {
                    //console.log('sold', a, profit)
                    //const profit = -1 * (1 - price / obj['bought']['price']) - 0.003
                    transactions.push({
                        timestamp: new Date(time).getTime(),
                        time: new Date(time).toLocaleString(),
                        price: Number(price * 0.997),
                        type: 'sell',
                        profit: Number(profit),
                        moving: rules[ruless[t]]['moving']
                    })
                    profits.push({
                        profit: profit,
                        marginProfit: Number(profit) * 3,
                        timestamp: new Date(time).getTime()
                    })
                    //console.log(profits)
                    bought = false
                    sold = true
                    sellRuleNo = 0
                    buyRuleNo = 0
                    isSellNext = false
                    isBuyNext = false
                    corridor = {}
                }
            }
            //console.log('after loop', profits)
            var generalProfit = 1
            profits.map(item => {
                generalProfit = Number(generalProfit) * (1 + Number(item['profit']))
            })

            var marginProfit = 1
            profits.map(item => {
                marginProfit = Number(marginProfit) * (1 + Number(item['marginProfit']))
            })
            //console.log('2')
            try {
                let averageHold = []
                for (var d in transactions) {
                    if (transactions[d]['type'] === 'buy') continue
                    else {
                        var sellTime = transactions[d]['timestamp']
                        var buyTime = transactions[d - 1]['timestamp']
                        averageHold.push(sellTime - buyTime)
                    }
                }
                //obj[indicator] = {}
                console.log('setting', ruless[t])
                obj[indicator][ruless[t]] = {
                    generalProfit: Number((generalProfit - 1) * 100).toFixed(2) + '%',
                    marginProfit: Number((marginProfit - 1) * 100).toFixed(2) + '%',
                    profits: profits,
                    transactions: transactions,
                    averageProfit: averageProfit,
                    platform: platform,
                    trades: {
                        //mode: 'sells only',
                        //ratio: (transactions.filter(item => item['type'] === 'sell' && item['profit'] > 0)).length / (transactions.filter(item => item['type'] === 'sell' && item['profit'] < 0)).length,
                        positive: {
                            amount: (transactions.filter(item => item['type'] === 'sell' && item['profit'] > 0)).length,
                            average: Number(await average(transactions.filter(item => item['type'] === 'sell' && item['profit'] > 0).map(item => Number(item['profit']))) * 100).toPrecision(4) + '%',
                            min: Number(Math.min(...(transactions.filter(item => item['type'] === 'sell' && item['profit'] > 0)).map(item => item['profit'])) * 100).toPrecision(4) + '%',
                            max: Number(Math.max(...(transactions.filter(item => item['type'] === 'sell' && item['profit'] > 0)).map(item => item['profit'])) * 100).toPrecision(4) + '%'
                        },
                        negative: {
                            amount: (transactions.filter(item => item['type'] === 'sell' && item['profit'] < 0)).length,
                            average: Number(await average(transactions.filter(item => item['type'] === 'sell' && item['profit'] < 0).map(item => Number(item['profit']))) * 100).toPrecision(4) + '%',
                            min: Number(Math.max(...(transactions.filter(item => item['type'] === 'sell' && item['profit'] < 0)).map(item => item['profit'])) * 100).toPrecision(4) + '%',
                            max: Number(Math.min(...(transactions.filter(item => item['type'] === 'sell' && item['profit'] < 0)).map(item => item['profit'])) * 100).toPrecision(4) + '%'
                        },
                        lastSell: new Date((await getLastSell())['timestamp']).toLocaleString() || undefined,
                        lastBuy: new Date((await getLastBuy())['timestamp']).toLocaleString() || undefined,
                        averageHold: Number((averageHold.reduce( ( p, c ) => p + c, 0 ) / averageHold.length) / 1000 / 60).toFixed(0) + 'min'
                    },
                    factor: factor
                    //rule: firstIndicator
                }
                //if (obj[indicator][ruless[t]]['trades']['negative']['amount'] === 0) delete obj[indicator][ruless[t]]['trades']['negative']
                //console.log(ruless[t], obj[indicator][ruless[t]])
            } catch (error) {
                console.log(error)
            }
            //console.log('generalProfit', generalProfit - 1, averageProfit)
            //
            //console.log(obj[indicator][ruless[t]]['trades'])

            async function average(array) {
                return new Promise((resolve, reject) => {
                    //console.log(array)
                    if (array.length === 0) {
                        resolve(0)
                        return
                    }
                    //console.log(typeof array, array)
                    var obj = 0
                    for (var a in array) {
                        obj = Number(obj) + Number(array[a])
                    }
                    //console.log(obj / array.length)
                    resolve(Number(obj / array.length))
                })
            }
        }
    }

    console.log('for loop done')

    fs.writeFileSync(`./data/tests/${id}_test.json`, JSON.stringify(obj, null, 3), "utf8")

};

async function main() {
    if (!platform) {
        console.log('define platform please!')
        process.exit()
        return
    }
    var allProducts
    if (platform === 'coinbase') {
        allProducts = await new Promise((resolve, reject) => {
            publicClient.getProducts((err, response, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
    } else {
        allProducts = await fetch('https://api.binance.com/api/v3/exchangeInfo')
            .then(async resp => {
                const data = await resp.json()
                return data['symbols'].filter(item => item['isMarginTradingAllowed'])
            })
            .catch(e => {
                console.log(e)
            })
    }
    var profitss = {}
    var allProducts = [
        {
            symbol: 'BTCUSDT'
        }
    ]
    for (var a in allProducts) {
        var id
        if (platform === 'coinbase') id = allProducts[a]['id']
        else id = allProducts[a]['symbol']
        //id = 'LINK-ETH'
        console.log(id, a, allProducts.length)
        if ((id.includes('USD') && !id.includes('USDC') && !id.includes('USDT') && !id.includes('BUSD')) || id.includes('GBP')) continue
        //else if (!id.includes('BTC') && !id.includes('ETH') && !id.includes('USDT') && !id.includes('XRP')) continue
        profitss[id] = {}
        await testRule(id)
            .then(data => {
                console.log('done with testing data', id)
            })
            .catch(e => {
                console.log('test rule error', e)
            })
        await sleep(500)
        if (fs.existsSync(`./data/tests/${id}_test.json`)) {
            var file = await fileUtils.loadFile(`./data/tests/${id}_test.json`)

            for (var indicator in file) {
                //profitss[id]['transactions'] = file[indicator]['transactions'].length || undefined
                for (var rule in file[indicator]) {
                    if (rule !== 'startTime' && rule !== 'endTime' && !profitss[id][`${rule} ${indicator}`]) {
                        var negative_amount = file[indicator][rule]['trades']['negative']['amount']
                        if (negative_amount === 0) negative_amount = 1
                        var positive_amount = file[indicator][rule]['trades']['positive']['amount']
                        if (positive_amount === 0) positive_amount = 1


                        file[indicator][rule]['trades']['ratio'] = Number(positive_amount / negative_amount).toFixed(2)
                        profitss[id][`${rule} ${indicator}`] = {
                            profit: Number(parseFloat(file[indicator][rule]['generalProfit'])),
                            marginProfit: Number(parseFloat(file[indicator][rule]['marginProfit'])),
                            trades: file[indicator][rule]['trades'],
                            factor: file[indicator][rule]['factor'],
                            platform: platform
                        }
                        if (platform === 'binance') {
                            var stats = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${id}`)
                            .then(async resp => {
                                const data = await resp.json()
                                return data
                            })
                            .catch(e => {
                                console.log(e)
                            })
                            //console.log(trades.length)
                            profitss[id][`${rule} ${indicator}`]['stats'] = {
                                volume: Number(stats['volume']) * Number(stats['lastPrice']),
                                trades: stats['count'],
                                priceChangePercent: stats['priceChangePercent']
                            }
                        }
                    }
                }
            }

            fs.writeFile(`./data/tests/allProfits.json`, JSON.stringify(profitss, null, 3), "utf8", async function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('exported')
                }
            })
        }
    }
    //process.exit()
    await sleep(2500)
    process.exit()
    //main()
}

main()

const indicators = require('./indicators');