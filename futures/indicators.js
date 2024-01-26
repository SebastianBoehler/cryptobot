var technicalIndicators = require('technicalindicators');
const crypto = require('crypto');
const fileUtils = require('../fileUtils');
//technicalIndicators.setConfig('precision', 8);

module.exports = {
    generateIndicators: async function (granularity, symbol, factor, slice, disableSlice, platform) {
        //granularity sets x min chart
        //console.log('granularity', granularity, array.length)
        //console.log(id)
        let steps = {
            'eight': parseInt(8 * factor),
            'thirteen': parseInt(13 * factor),
            'twentyone': parseInt(21 * factor),
            'fiftyfive': parseInt(55 * factor)
        }

        return new Promise(async (resolve, reject) => {
            let array = await fileUtils.loadData(symbol, platform || 'BINANCE', slice ? (disableSlice ? 175000 : 17500) : 15000, undefined, slice)
                .catch(e => {
                    console.error(e)
                    return undefined
                })
            if (!array) {
                resolve(undefined)
                return
            }
            //console.log(slice, disableSlice, array.length)
            //console.log('history length', array.length, array[0]['id'], array[array.length - 1]['id'])
            if (slice && !disableSlice) {
                //console.log('inside 1')
                array = array.slice(0, slice)
                array = array.slice(-15000)
            } else if (disableSlice) {
                //console.log('inside 2')
                array = array.slice(0, slice)
                //array = array.slice(-100000)
            }
            //console.log('array length', array.length)
            //console.log('array length in indicators', array.length, array[array.length - 1]['id'], slice)
            let localArray = [] //= array.filter((x, i) => i % granularity == 0)
            localArray = array.filter((x, i) => {
                let timeArray = array.slice(i - granularity + 1, i + 1)
                //console.log(Math.max(...timeArray.map(item => parseFloat(item['high']))))
                if (i % granularity == 0 && timeArray.length >= 1) {
                    x['open'] = timeArray[0]['open'] || timeArray[0]['price']
                    x['close'] = timeArray[timeArray.length - 1]['close'] || timeArray[timeArray.length - 1]['price']
                    x['high'] = Math.max(...timeArray.map(item => parseFloat(item['high'] || item['price'])))
                    x['low'] = Math.min(...timeArray.map(item => parseFloat(item['low'] || item['price'])))
                    return x
                } else return undefined
            })
            localArray.shift()
            //console.log(localArray.length)
            //console.log(localArray.slice(0, 1))

            if (false) for (var c = 0; c < array.length; c = c + granularity) {
                if (granularity !== 1) {
                    var endValue
                    if (array[c + granularity]) endValue = array[c + granularity]['time']
                    else endValue = array[array.length - 1]['time']
                    var tempArray = array.filter(item => Number(item['time']) <= Number(endValue) && Number(item['time']) > Number(array[c]['time']))
                    if (tempArray.length === 0) continue
                    var latest = tempArray[tempArray.length - 1]
                    //item['id'] = tempArray[tempArray.length - 1]['id']
                    //item['price'] = tempArray[tempArray.length - 1]['price']
                    //item['time'] = tempArray[tempArray.length - 1]['time']
                    latest['open'] = Number(tempArray[0]['price'])
                    latest['close'] = Number(tempArray[tempArray.length - 1]['price'])
                    latest['high'] = Math.max(...tempArray.map(item => Number(item['high'] || item['price'])))
                    latest['low'] = Math.min(...tempArray.map(item => Number(item['low'] || item['price'])))
                    //latest['lows'] = tempArray.map(item => Number(item['low'] || item['price']))
                    //latest['ids'] = tempArray.map(item => item['id'])
                    localArray.push(latest)
                }
                //console.log(array[c])
                else localArray.push(array[c])
            }

            //console.log(localArray[0]['id'], localArray[1]['id'], granularity)
            //console.log(localArray.length, granularity)
            //fullArray['avrDailyVolatility'] = await avrDailyVolatility() ERROR
            let closes = localArray.map(item => parseFloat(item['close']))
            let opens = localArray.map(item => parseFloat(item['open']))
            let highs = localArray.map(item => parseFloat(item['high']))
            let lows = localArray.map(item => parseFloat(item['low']))

            //console.log(closes.pop(), opens.pop(), highs.pop(), lows.pop())

            let results = {}

            let ema_eight = technicalIndicators.EMA.calculate({
                period: steps['eight'],
                values: closes
            })

            let wma_eight = technicalIndicators.WMA.calculate({
                period: steps['eight'],
                values: closes
            })

            let ema_thirteen = technicalIndicators.EMA.calculate({
                period: steps['thirteen'],
                values: closes
            })

            let wma_thirteen = technicalIndicators.WMA.calculate({
                period: steps['thirteen'],
                values: closes
            })

            let ema_twentyone = technicalIndicators.EMA.calculate({
                period: steps['twentyone'],
                values: closes
            })

            let wma_twentyone = technicalIndicators.WMA.calculate({
                period: steps['twentyone'],
                values: closes
            })

            let ema_fiftyfive = technicalIndicators.EMA.calculate({
                period: steps['fiftyfive'],
                values: closes
            })

            let RSI = technicalIndicators.RSI.calculate({
                values: closes,
                period: 14
            })

            let RSI_EMA = technicalIndicators.EMA.calculate({
                period: 8,
                values: RSI
            })

            let fastRSIema = technicalIndicators.EMA.calculate({
                period: 8,
                values: RSI
            })

            let slowRSIema = technicalIndicators.EMA.calculate({
                period: 13,
                values: RSI
            })

            let stochRSI = technicalIndicators.StochasticRSI.calculate({
                values: closes,
                rsiPeriod: 20,
                stochasticPeriod: 20,
                kPeriod: 3,
                dPeriod: 3
            })

            let BollingerBands = technicalIndicators.BollingerBands.calculate({
                period: 15,
                values: closes,
                stdDev: 2
            })

            let closesPeriod = closes.slice(-75)
            let changeRate = closesPeriod.map((item, index) => {
                if (!closesPeriod[index - 1]) return 1
                let diff = Math.max(...closesPeriod) - Math.min(...closesPeriod) 
                let diff2 = Math.abs(item - closesPeriod[index - 1])
                return diff / diff2
            })

            let WilliamsR = technicalIndicators.WilliamsR.calculate({
                high: highs,
                low: lows,
                close: closes,
                period: 14
            })

            let WilliamsR_EMA = technicalIndicators.EMA.calculate({
                period: 8,
                values: WilliamsR
            })

            let heikinAshi = technicalIndicators.HeikinAshi.calculate({
                open: opens,
                close: closes,
                high: highs,
                low: lows
            })

            //console.log(opens.length, closes.length, highs.length, lows.length)
            //console.log(heikinAshi)

            //console.log('change rate', Math.max(...changeRate))

            results['eight'] = ema_eight[ema_eight.length - 1]
            results['prev_eight'] = ema_eight[ema_eight.length - 2]

            results['thirteen'] = ema_thirteen[ema_thirteen.length - 1]
            results['prev_thirteen'] = ema_thirteen[ema_thirteen.length - 2]

            results['twentyone'] = ema_twentyone[ema_twentyone.length - 1]
            results['prev_twentyone'] = ema_twentyone[ema_twentyone.length - 2]

            results['fiftyfive'] = ema_fiftyfive[ema_fiftyfive.length - 1]
            results['prev_fiftyfive'] = ema_fiftyfive[ema_fiftyfive.length - 2]

            results['RSI'] = RSI[RSI.length - 1]
            results['RSI_prev'] = RSI[RSI.length - 2]
            results['RSI_EMA'] = RSI_EMA[RSI_EMA.length - 1]
            results['RSI_EMA_prev'] = RSI_EMA[RSI_EMA.length - 2]
            results['fast_RSI'] = fastRSIema[fastRSIema.length - 1]
            results['fast_RSI_prev'] = fastRSIema[fastRSIema.length - 2]
            results['slow_RSI'] = slowRSIema[slowRSIema.length - 1]
            results['slow_RSI_prev'] = slowRSIema[slowRSIema.length - 2]

            results['RSI_UP'] = Math.min(...RSI.slice(-3)) <= results['RSI']
            results['RSI_DOWN'] = Math.max(...RSI.slice(-3)) >= results['RSI']

            results['WilliamsR'] = WilliamsR[WilliamsR.length - 1]
            results['WilliamsR_EMA'] = WilliamsR_EMA[WilliamsR_EMA.length - 1]

            results['volatility'] = await avgVolatility(closes.slice(-30))

            results['BB'] = BollingerBands[BollingerBands.length - 1]

            results['close'] = closes[closes.length - 1]

            results['stochRSI'] = stochRSI[stochRSI.length - 1]

            results['changeRate'] = changeRate[changeRate.length - 1]

            results['heikinAshi'] = {
                open: heikinAshi['open'][heikinAshi['open'].length - 1],
                close: heikinAshi['close'][heikinAshi['close'].length - 1],
                high: heikinAshi['high'][heikinAshi['high'].length - 1],
                low: heikinAshi['low'][heikinAshi['low'].length - 1]
            }

            //results['direction'] = await genDirection()

            async function genDirection() {
                let diffs = []
                for (var u = localArray.length - 30; u < localArray.length; u++) {
                    let close = localArray[u]['close']
                    let open = localArray[u]['open']

                    let diff = close / open - 1
                    diffs.push(diff)
                    //if (u >= localArray.length - 1 && granularity === 15) console.log(new Date(+localArray[u - 1]['time']).toLocaleTimeString(), localArray[u - 1]['open'], open)
                }
                let avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
                let latest = diffs[diffs.length - 1]
                return {
                    latest,
                    avg
                }
            }

            //fullArray['array'] = fullArray['array'].reverse()
            //fullArray['difference'] = Number(fullArray['eight'] / fullArray['fiftyfive']).toFixed(3)

            resolve(results)

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

            async function change(array, min) {
                //console.log('array', typeof array)
                var price = Number(array[array.length - 1]['price'])
                var time = new Date()
                time.setMinutes(time.getMinutes() - min)

                var timeframe = array.filter(item => Number(item['time']) <= time.getTime())
                if (timeframe.length >= 1) array = timeframe
                else array = [
                    array[0]
                ]
                var lastprice
                if (array.length >= 1) lastprice = Number(array[array.length - 1]['price'])
                else return 1

                const change = Number(price / lastprice)

                return change
            }

            async function addArray(array1, localArray) {
                array1.reverse()
                localArray.reverse()

                if (array1.length <= 1) return []

                for (var a in localArray) {
                    for (var object in localArray[a]) {
                        array1[a][object] = localArray[a][object]
                    }
                }

                array1.reverse()
                return array1
            }

            async function avgVolatility(array) {
                let differences = []
                let latest
                for (var a = 1; a < array.length; a++) {
                    let volatility = Math.abs(array[a] / array[a - 1] - 1)
                    differences.push(volatility)
                    if (a === array.length - 1) latest = volatility
                }
                let sum = differences.reduce((a, b) => a + b, 0)
                return {
                    avg: sum / differences.length,
                    latest: latest,
                    direction: array[array.length - 1] >= array[array.length - 2] ? 'up': 'down'
                }
            }
        })
    }
}