const fileUtils = require('./fileUtils');
const fetch = require('node-fetch');
const {
    CanvasRenderService
} = require('chartjs-node-canvas');
const {
    MessageAttachment
} = require('discord.js');
var {
    generateIndicators
} = require('./indicators');
var fs = require('fs');
var Jimp = require('jimp');
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = '%'

client.on("ready", () => {
    console.log("I am ready!");
    upTrending()
});

client.on("message", async (message) => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === 'chart') {
        const pair = args[0]
        const platform = args[1]
        const granularity = args[2] || 15
        const indicator = args[3] || 'SMA'
        //console.log('pair', pair)
        const chart = await generateChartCanvas(pair, platform, granularity, indicator)
        const attachment = new MessageAttachment(chart)

        await message.channel.send(attachment)
            .catch(e => {
                console.log(e)
            })
    } else if (command === 'image') {
        const pair = args[0]
        const platform = args[1]
        const image = await generateImage(pair, platform)

        console.log(image)

        const attachment = new MessageAttachment(image)
        await message.channel.send(attachment)
            .catch(e => {
                console.log(e)
            })
    } else if (command === 'delete') {
        //const fetched = await message.channel.fetchMess;
        message.channel.bulkDelete(Number(args[0]));
        console.log("Deleted " + args[0] + " messages")
    }
    //await message.delete()
});

client.on('raw', async event => {
    return
    if (event.t === 'MESSAGE_REACTION_ADD') {

        const emoji = event['d']['emoji'] //name / id

        let channel = await client.channels.fetch(event.d.channel_id);
        let message = channel.fetch(event.d.message_id).then(msg => {
            let user = client.users.cache.find(user => user.id === event['d']['user_id']);

            console.log(JSON.stringify(user, null, 2))

            if (msg.author.id == bot.user.id && msg.content != initialMessage) {

                var re = `\\*\\*"(.+)?(?="\\*\\*)`;
                var role = msg.content.match(re)[1];

                if (user.id != bot.user.id) {
                    var roleObj = msg.guild.roles.find(r => r.name === role);
                    var memberObj = msg.guild.members.get(user.id);

                    if (event.t === "MESSAGE_REACTION_ADD") {
                        memberObj.addRole(roleObj)
                    } else {
                        memberObj.removeRole(roleObj);
                    }
                }
            }
        })

    } else if (event.t === "MESSAGE_REACTION_REMOVE") {

    }
})

setInterval(async () => {
    upTrending()
}, 1000 * 60 * 10);

async function upTrending() {
    var channel
    var allProducts = await fetch('https://api.binance.com/api/v3/ticker/price')
    .then(async resp => {
        const data = await resp.json()
        return data
    })
    .catch(e => {
        console.log(e)
    })
    try {
        channel = await client.channels.cache.find(channel => channel.id === '775058372784816169')
        await channel.bulkDelete(50)
        await channel.bulkDelete(50)
        channel = await client.channels.cache.find(channel => channel.id === '775104099309191188')
        await channel.bulkDelete(50)
        await channel.bulkDelete(50)
    } catch (error) {
        
    }
    for (var a in allProducts) {
        const id = allProducts[a]['symbol']
        const database = await fileUtils.loadData(id, 'BINANCE')

        const object = {
            'eight': 8,
            'thirteen': 13,
            'twentyone': 21,
            'fiftyfive': 55
        }

        var {
            array: indicators5min,
            lineMoving: moving5min
        } = await generateIndicators('EMA', 5, database, true, object);
        indicators5min = indicators5min.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 5 == 0)
        var {
            array: indicators15min,
            lineMoving: moving15min
        } = await generateIndicators('EMA', 15, database, true, object);
        indicators15min = indicators15min.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 15 == 0)
        var {
            array: indicators25min,
            lineMoving: moving25min,
            upTrend,
            change15min
        } = await generateIndicators('EMA', 25, database, true, object);
        indicators25min = indicators25min.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 25 == 0)

        var {
            array: indicators1h,
            lineMoving: moving1h,
            change: change1h
        } = await generateIndicators('EMA', 60, database, true, object);
        indicators1h = indicators1h.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 15 == 0)

        var {
            array: indicators3h,
            lineMoving: moving3h,
            change: change3h
        } = await generateIndicators('EMA', 60 * 3, database, true, object);
        indicators3h = indicators3h.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 15 == 0)

        console.log('change 3h', indicators3h.length)

        if (moving5min === 1 && moving15min === 1 && moving25min === 1 && upTrend && change15min > 1.01) {
            channel = await client.channels.cache.find(channel => channel.id === '775058372784816169')
            var image = await generateImage(id, 'BINANCE')
            image = new MessageAttachment(image)
            channel.send(image)

            var chart = await generateChartCanvas(id, 'BINANCE', 5, 'SMA')
            chart = new MessageAttachment(chart)
            channel.send(chart)
        }
        if (moving1h === 1 && moving3h === 1 && change1h >= 1.01 && change3h >= 1.02) {
            channel = await client.channels.cache.find(channel => channel.id === '775104099309191188')
            var image = await generateImage(id, 'BINANCE')
            image = new MessageAttachment(image)
            channel.send(image)

            var chart = await generateChartCanvas(id, 'BINANCE', 30, 'SMA', 24 * 5)
            chart = new MessageAttachment(chart)
            channel.send(chart)
        }
    }

    channel = await client.channels.cache.find(channel => channel.id === '775064353460060180')
    allProducts = await new Promise((resolve, reject) => {
        publicClient.getProducts((err, response, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })

    try {
        await channel.bulkDelete(50)
        await channel.bulkDelete(50) 
    } catch (error) {
        
    }

    for (var a in allProducts) {
        const id = allProducts[a]['id']
        if ((id.includes('USD') && !id.includes('USDC')) || id.includes('GBP')) continue
        const database = await fileUtils.loadData(id, 'COINBASE')

        const object = {
            'eight': 8,
            'thirteen': 13,
            'twentyone': 21,
            'fiftyfive': 55
        }

        var {
            array: indicators5min,
            lineMoving: moving5min
        } = await generateIndicators('EMA', 5, database, true, object);
        indicators5min = indicators5min.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 5 == 0)
        var {
            array: indicators15min,
            lineMoving: moving15min
        } = await generateIndicators('EMA', 15, database, true, object);
        indicators15min = indicators15min.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 15 == 0)
        var {
            array: indicators25min,
            lineMoving: moving25min,
            upTrend,
            change15min
        } = await generateIndicators('EMA', 25, database, true, object);
        indicators25min = indicators25min.filter(item => item['fiftyfive'] !== undefined)//.filter((x, i) => i % 25 == 0)

        if (moving5min === 1 && moving15min === 1 && moving25min === 1 && upTrend && change15min > 1.01) {
            var image = await generateImage(id, 'COINBASE')
            image = new MessageAttachment(image)
            channel.send(image)

            var chart = await generateChartCanvas(id, 'COINBASE', 5, 'SMA')
            chart = new MessageAttachment(chart)
            channel.send(chart)
        }
    }
}

client.login("NzczODYxOTY3NDA0MjA0MDMy.X6PZHg.oenHoWEFgwFJ5bcuGKwZODFeruY");

async function generateChartCanvas(pair, platform, granularity, indicator, hours) {
    if (!hours) hours = 24
    const chartCallback = (ChartJS) => {
        ChartJS.plugins.register({
            beforeDraw: (chartInstance) => {
                const {
                    chart
                } = chartInstance
                const {
                    ctx
                } = chart
                ctx.fillStyle = '#363940'
                ctx.fillRect(0, 0, chart.width, chart.height)
            },
        })
    }

    const width = 1600
    const height = 800
    return new Promise(async (resolve, reject) => {
        const canvas = new CanvasRenderService(width, height, chartCallback)

        var database = await fileUtils.loadData(pair, platform.toUpperCase())

        const object = {
            'eight': 8,
            'thirteen': 13,
            'twentyone': 21,
            'fiftyfive': 55
        }

        var {
            array: indicators
        } = await generateIndicators(indicator, granularity, database, true, object);
        indicators = indicators.filter(item => item['fiftyfive'] !== undefined).filter((x, i) => i % granularity == 0)

        var timeframe = new Date()
        timeframe.setHours(timeframe.getHours() - hours)

        indicators = indicators.filter(item => Number(item['time']) > timeframe.getTime())

        //console.log(indicators.length)

        var dataset = [{
                label: 'Price',
                data: indicators.map((item) => {
                    return item['price']
                }),
                borderColor: '#314DED',
                borderWidth: 6,
                type: 'line',
                lineTension: 0.2,
                pointRadius: 0,
                yAxisID: 'A'
            },
            {
                label: `${indicator} 8`,
                data: indicators.map((item) => {
                    return item['eight']
                }),
                borderColor: '#b700ff',
                borderWidth: 3,
                type: 'line',
                lineTension: 0.2,
                pointRadius: 0,
                fill: false,
                yAxisID: 'A'
            },
            {
                label: `${indicator} 13`,
                data: indicators.map((item) => {
                    return item['thirteen']
                }),
                borderColor: '#37ff00',
                borderWidth: 3,
                type: 'line',
                lineTension: 0.2,
                pointRadius: 0,
                yAxisID: 'A',
                fill: false
            },
            {
                label: `${indicator} 21`,
                data: indicators.map((item) => {
                    return item['twentyone']
                }),
                borderColor: '#ffdd00',
                borderWidth: 3,
                type: 'line',
                lineTension: 0.2,
                pointRadius: 0,
                yAxisID: 'A',
                fill: false
            },
            {
                label: `${indicator} 55`,
                data: indicators.map((item) => {
                    return item['fiftyfive']
                }),
                borderColor: '#e30000',
                borderWidth: 3,
                type: 'line',
                lineTension: 0.2,
                pointRadius: 0,
                yAxisID: 'A',
                fill: false
            }
        ]

        var labels = indicators.map((item) => {
            var time = new Date(Number(item['time']));
            return time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })
        })

        const configuration = {
            data: {
                labels: labels,
                datasets: dataset,
            },
            options: {
                legend: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: '#46496c',
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 20,
                            fontColor: "#9097b9",
                            fontSize: 12,
                            //beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        id: 'A',
                        position: 'left',
                        gridLines: {
                            color: '#46496c',
                            display: false
                        },

                        ticks: {
                            fontColor: "#9097b9",
                            fontSize: 12,
                            beginAtZero: false
                        }
                    }]
                }
            }
        }

        const image = await canvas.renderToBuffer(configuration)

        resolve(image)
    })
}

async function generateImage(pair, platform) {
    platform = platform.toUpperCase()
    return new Promise(async (resolve, reject) => {
        //console.log(pair, platform)
        if (platform === 'BINANCE') pair = pair.replace('-', '')
        //console.log(pair)
        var database = await fileUtils.loadData(pair, platform)
        //database = database.map(item => Number(item['price']))

        const object = {
            'eight': 8,
            'thirteen': 13,
            'twentyone': 21,
            'fiftyfive': 55
        }

        var {
            change15min,
            change1h,
            change1d
        } = await generateIndicators('EMA', 15, database, true, object)

        //console.log(database)

        Jimp.read(`./img/${platform.toLowerCase()}.png`)
            .then(async image => {
                //image.color([{ apply: 'xor', params: ['#ff0000'] }])
                //image.resize()
                await new Promise((resolve, reject) => {
                    Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(async font => {
                        image.print(font, 1210, 17, {
                            text: pair.toUpperCase(),
                            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                        }, 160)
                        resolve()
                    });
                })
                await new Promise((resolve, reject) => {
                    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then(async font => {
                        image.print(font, 1205, 450, {
                            text: `${Number((change15min - 1) * 100).toFixed(0)}%`,
                            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                        }, 160)
                        resolve()
                    });
                })
                await new Promise((resolve, reject) => {
                    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then(async font => {
                        image.print(font, 735, 450, {
                            text: `${Number((change1h - 1) * 100).toFixed(0)}%`,
                            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                        }, 160)
                        resolve()
                    });
                })
                await new Promise((resolve, reject) => {
                    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then(async font => {
                        image.print(font, 225, 450, {
                            text: `${Number((change1d - 1) * 100).toFixed(0)}%`,
                            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                        }, 160)
                        resolve()
                    });
                })

                resolve(await image.getBufferAsync(Jimp.AUTO))
            })
            .catch(err => {
                console.error(err);
                reject(err)
            });
    })
}