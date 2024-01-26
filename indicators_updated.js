var technicalIndicators = require('technicalindicators');
const crypto = require('crypto');
const fileUtils = require('./fileUtils')
const fs = require('fs');
//technicalIndicators.setConfig('precision', 8);

module.exports = {
    generateIndicators: async function (indicator, granularity, array, returnArray, factor) {
        return new Promise(async (resolve, reject) => {
            //granularity sets x min chart
            //console.log('granularity', granularity, array.length)
            //let result = []
            //console.log(id)
            let steps = {
                'eight': parseInt(8 * factor),
                'thirteen': parseInt(13 * factor),
                'twentyone': parseInt(21 * factor),
                'fiftyfive': parseInt(55 * factor)
            }

            let localArray = {
                'array': []
            }

            for (var c = 0; c < array.length; c = c + granularity) {
                if (granularity !== 1) {
                    var endValue = array[c + granularity] ? array[c + granularity]['time'] : array[array.length - 1]['time']
                    var tempArray = array.filter(item => Number(item['time']) <= Number(endValue) && Number(item['time']) > Number(array[c]['time']))

                    if (tempArray.length === 0) continue
                    var latest = tempArray[tempArray.length - 1]

                    latest['open'] = Number(tempArray[0]['price'])
                    latest['close'] = Number(latest['price'])
                    latest['high'] = Math.max(...tempArray.map(item => Number(item['high'] || item['price'])))
                    latest['low'] = Math.min(...tempArray.map(item => Number(item['low'] || item['price'])))

                    localArray['array'].push(latest)
                }
                //console.log(array[c])
                else localArray['array'].push(array[c])
            }

            for (var a in steps) {
                let data = new technicalIndicators.EMA.calculate({
                    period: steps[a],
                    values: localArray['array'].map(item => Number(item['close'])),
                    //reversedInput: true
                })
                //console.log(a, data.length, localArray.length, steps[a])

                localArray[a] = []
                localArray['array'].forEach((item, index) => {
                    let start = localArray['array'].length - data.length
                    //console.log(index, start)
                    if (index >= start) {
                        //console.log(start, localArray['array'].length, data.length, index - start)
                        item[a] = data[index - start]
                        //localArray[a].push(data[index - start])
                    } //else localArray[a].push(undefined)
                })
            }

            //console.log(localArray)
            //console.log(localArray[localArray.length - 1])
            //console.log(localArray['array'])

            resolve(localArray['array'])
        })

        return new Promise(async (resolve, reject) => {
            let localArray = [] //= array.filter((x, i) => i % granularity == 0)
            //console.log(array[array.length - 1])
            //console.log('indicator',array.length, granularity)
            if (!returnArray) {
                var filter = new Date()
                filter.setHours(filter.getHours() - 60)
                //array = array.filter(item => Number(item['time']) >= filter.getTime())
            }
            for (var c = 0; c < array.length; c = c + granularity) {
                if (granularity !== 1) {
                    var endValue
                    if (array[c + granularity]) endValue = array[c + granularity]['time']
                    else endValue = array[array.length - 1]['time']
                    var tempArray = array.filter(item => Number(item['time']) <= Number(endValue) && Number(item['time']) > Number(array[c]['time']))
                    if (granularity === 15) {
                        //console.log('temp array range', array[c]['id'], tempArray[tempArray.length - 1]['id'], tempArray.length)
                        //console.log('temp array length', tempArray.length)
                    }
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
            //console.log(localArray.length, granularity)

            //average Daily Volatility
            async function avrDailyVolatility() {
                var end = new Date(Number(array[array.length - 1]['time']))
                var values = []
                for (var f = 0; f < 90000; f + 24) {
                    var zero = new Date(Number(array[0]['time']))
                    zero.setHours(zero.getHours() + f)
                    var timeframe = new Date(zero.getTime())
                    timeframe.setHours(timeframe.getHours() + 24)
                    if (timeframe.getTime() >= end.getTime()) break
                    var max = Math.max(...array.filter(item => Number(item['time']) >= zero.getTime() && Number(item['time']) <= timeframe.getTime()))
                    var min = Math.min(...array.filter(item => Number(item['time']) >= zero.getTime() && Number(item['time']) <= timeframe.getTime()))
                    const diff = max / min
                    console.log(diff)
                    values.push(diff)
                }
                const average = values.reduce((a, b) => a + b) / values.length;
                return average
            }
            //fullArray['avrDailyVolatility'] = await avrDailyVolatility() ERROR

            var fullArray = {
                array: [],
                time: array[array.length - 1]['time'],
                upTrendPattern: await detectPattern(array.map(item => Number(item['price'])))
            }

            async function detectPattern(array) {
                var data = array.slice(array.length - 45 * granularity, array.length)
                var index = 0
                var prev = {
                    max: undefined,
                    min: undefined
                }
                for (var f = 0; f < data.length; f = f + 5) {
                    var max = Math.max(...data.slice(f, f + 5))
                    var min = Math.min(...data.slice(f, f + 5))
                    if (prev['max']) {
                        if (max > prev['max']) index++
                        if (min > prev['min']) index++

                        if (max < prev['max'] && min < prev['min']) index--
                    }
                    prev['max'] = max
                    prev['min'] = min
                }
                return index
            }

            //console.log(localArray)

            localArray.forEach(async (item, a) => {
                //var timeframe = array.filter(item => Number(item['time']) <= Number(localArray[a]['time']))
                //console.log(timeframe.length)
                item['time'] = item['timestamp'] || item['time']
                delete item['timestamp']
                //console.log(item)
                fullArray['array'].push(item)
            })

            //console.log(crypto.createHash('sha1').update(JSON.stringify(array)).digest('hex'))

            for (var b in steps) {
                if (!indicator) break
                var results = [];
                var technicalIndicator
                if (indicator === 'EMA') technicalIndicator = technicalIndicators.EMA
                else if (indicator === 'SMA') technicalIndicator = technicalIndicators.SMA
                else technicalIndicator = technicalIndicators.EMA
                var technicalIndicator = new technicalIndicator({
                    period: steps[b],
                    values: [],
                    //reversedInput: true
                });
                localArray.forEach((item, index) => {
                    var result = technicalIndicator.nextValue(Number(item['price']));
                    if (result) {
                        results.push(result)
                    }
                })

                fullArray['array'].reverse()
                results = results.reverse()
                for (var a = 0; a < results.length; a++) {
                    fullArray['array'][a][b] = results[a]
                }
                fullArray['array'].reverse()
            }

            var lineArray = fullArray['array'].map(item => item['fiftyfive'])

            //fullArray['array'] = fullArray['array'].reverse()
            fullArray['eight'] = fullArray['array'][fullArray['array'].length - 1]['eight']
            fullArray['thirteen'] = fullArray['array'][fullArray['array'].length - 1]['thirteen']
            fullArray['twentyone'] = fullArray['array'][fullArray['array'].length - 1]['twentyone']
            fullArray['fiftyfive'] = fullArray['array'][fullArray['array'].length - 1]['fiftyfive']
            fullArray['difference'] = Number(fullArray['eight'] / fullArray['fiftyfive']).toFixed(3)
            fullArray['indicator'] = indicator
            fullArray['type'] = `${granularity}Min${indicator}`
            fullArray['price'] = Number(array[array.length - 1]['price'])
            fullArray['change15min'] = await change(array, 15)
            fullArray['change1h'] = await change(array, 60)
            fullArray['change1d'] = await change(array, 60 * 24)
            fullArray['change3d'] = await change(array, 60 * 24 * 3)
            fullArray['change7d'] = await change(array, 60 * 24 * 7)
            fullArray['upTrend'] = await change(array, 5) > 1 && await change(array, 15) > 1 && await change(array, 25) > 1

            //console.log(localArray[0])
            const bollingerBand = technicalIndicators.BollingerBands.calculate({
                period: 14,
                values: localArray.map(item => Number(item['price'])),
                stdDev: 2
            })
            fullArray['BB'] = bollingerBand
            //console.log(fullArray['BB'])
            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], bollingerBand.map((item, a) => {
                    return item = {
                        'BollingerBands': {
                            lower: item['lower'],
                            middle: item['middle'],
                            upper: item['upper'],
                            pb: item['pb'],
                            diff: item['upper'] / item['lower'],
                        }
                    }
                }))
            }

            fullArray['BB'] = fullArray['BB'][fullArray['BB'].length - 1]

            var RSI = technicalIndicators.RSI.calculate({
                values: localArray.map(item => Number(item['price'])),
                period: 14
            })

            fullArray['RSI'] = RSI[RSI.length - 1]
            //console.log(RSI[0])
            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], RSI.map((item, a) => {
                    const crossUp = technicalIndicators.CrossUp.calculate({
                        lineA: RSI.slice(a - 10, a),
                        lineB: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
                    })
                    const crossDown = technicalIndicators.CrossDown.calculate({
                        lineA: RSI.slice(a - 10, a),
                        lineB: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70]
                    })
                    //console.log(crossUp[crossUp.length - 1])
                    return item = {
                        'RSI': {
                            val: Number(item),
                            crossUp: crossUp[crossUp.length - 1],
                            crossDown: crossDown[crossDown.length - 1]
                        }
                    }
                }))
            }

            const AwesomeOscillator = technicalIndicators.AwesomeOscillator.calculate({
                high: localArray.map(item => Number(item['high'])),
                low: localArray.map(item => Number(item['low'])),
                fastPeriod: 5,
                slowPeriod: 34
            })

            fullArray['AO'] = {
                val: AwesomeOscillator[AwesomeOscillator.length - 1],
                prev: AwesomeOscillator[AwesomeOscillator.length - 2]
            }

            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], AwesomeOscillator.map((item, a) => {
                    let crossUp = technicalIndicators.CrossUp.calculate({
                        lineA: AwesomeOscillator.slice(a - 10, a + 1),
                        lineB: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    })
                    let crossDown = technicalIndicators.CrossDown.calculate({
                        lineA: AwesomeOscillator.slice(a - 10, a + 1),
                        lineB: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    })
                    return item = {
                        'AO': {
                            val: item,
                            prev: AwesomeOscillator[a - 1] || undefined,
                            crossUp: crossUp[crossUp.length - 1],
                            crossDown: crossDown[crossDown.length - 1]
                        }
                    }
                }))

            }
            let HeikinAshi = technicalIndicators.HeikinAshi.calculate({
                open: localArray.map(item => Number(item['open'])),
                close: localArray.map(item => Number(item['close'])),
                low: localArray.map(item => Number(item['low'])),
                high: localArray.map(item => Number(item['high']))
            })

            //if (granularity === 15) console.log(fullArray['HeikinAshi']['close'])

            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], HeikinAshi['close'].map((item, a) => {
                    return item = {
                        'HeikinAshi': {
                            close: item,
                            open: HeikinAshi['open'][a],
                            high: HeikinAshi['high'][a],
                            low: HeikinAshi['low'][a]
                        }
                    }
                }))
            }


            fullArray['MACD'] = technicalIndicators.MACD.calculate({
                values: localArray.map(item => Number(item['close'])),
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                SimpleMAOscillator: true,
                SimpleMASignal: true
            })

            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], fullArray['MACD'].map((item, a) => {
                    const crossUp = technicalIndicators.CrossUp.calculate({
                        lineA: fullArray['MACD'].slice(a - 10, a + 1).map(item => item['MACD']),
                        lineB: fullArray['MACD'].slice(a - 10, a + 1).map(item => item['signal'])
                    })
                    const crossDown = technicalIndicators.CrossDown.calculate({
                        lineA: fullArray['MACD'].slice(a - 10, a + 1).map(item => item['MACD']),
                        lineB: fullArray['MACD'].slice(a - 10, a + 1).map(item => item['signal'])
                    })
                    return item = {
                        'MACD': {
                            MACD: item['MACD'],
                            signal: item['signal'],
                            historgram: item['histogram'],
                            crossUp: crossUp[crossUp.length - 1],
                            crossDown: crossDown[crossDown.length - 1]
                        }
                    }
                }))
            }

            fullArray['MACD'] = fullArray['MACD'][fullArray['MACD'].length - 1]

            const WilliamsR = technicalIndicators.WilliamsR.calculate({
                high: localArray.map(item => Number(item['high'])),
                close: localArray.map(item => Number(item['price'])),
                low: localArray.map(item => Number(item['low'])),
                period: 14
            })

            fullArray['W%R'] = WilliamsR[WilliamsR.length - 1]

            fullArray['array'] = await addArray(fullArray['array'], WilliamsR.map(item => {
                return item = {
                    'W%R': Number(item)
                }
            }))

            let IchimokuCloud = technicalIndicators.IchimokuCloud.calculate({
                high: localArray.map(item => Number(item['high'])),
                low: localArray.map(item => Number(item['low'])),
                conversionPeriod: 9,
                basePeriod: 26,
                spanPeriod: 52,
                displacement: 26
            })

            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], IchimokuCloud.map(item => {
                    return item = {
                        'IchimokuCloud': {
                            conversion: item['conversion'],
                            base: item['base'],
                            spanA: item['spanA'],
                            spanB: item['spanB']
                        }
                    }
                }))
            }

            //if (!returnArray) delete fullArray['array']


            //console.log(fullArray['array'][fullArray['array'].length - 1])

            var lineArray = localArray.map(item => Number(item['fiftyfive']))
            lineArray = lineArray.slice(lineArray.length - 7, lineArray.length)
            const lineMove = await lineMoving()
            var lineTrend = 0

            if (lineMove['count'] >= lineMove['length'] * 0.75) lineTrend = 1
            else if (lineMove['count'] <= lineMove['length'] * 0.5) lineTrend = -1

            fullArray['lineMoving'] = lineTrend
            fullArray['moving'] = Number(Math.max(...lineArray.slice(lineArray.length - 26, lineArray.length - 2)) / Math.min(...lineArray.slice(lineArray.length - 26, lineArray.length - 2))).toFixed(5)
            resolve(fullArray)
            return

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
        })

    }
}