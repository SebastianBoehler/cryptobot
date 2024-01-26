﻿var database = null
var data = null
var indicators = null
var products = null
var forecast = null

function openLink(url) {
    const urlParams = new URLSearchParams(window.location.search)
    window.location = url + `?portfolio=${urlParams.get('portfolio')}`
}

$(document).ready(function () {

    window.onerror = function (e) {
        alert('An error occured')
        console.log(e)
        //location.reload()
    }

    /* -------------------- AOS Setting -------------------- */

    AOS.init();

    /* -------------------- Lazy Load Setting -------------------- */

    $(function () {
        $('img').lazy({
            effect: "fadeIn",
            effectTime: 1000,
            threshold: 10,
        });
    });

    /* -------------------- Image Pop Up Setting -------------------- */

    $('.image-pop-up').magnificPopup({
        type: 'image'
    });

    /* -------------------- Toggle Setting -------------------- */

    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $(".page").toggleClass("toggled");
        $(".sidebar").toggleClass("toggled");
    });

    /* -------------------- Tooltip Setting -------------------- */

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    /* -------------------- Input File Setting -------------------- */

    'use strict';

    ;
    (function ($, window, document, undefined) {
        $('.inputfile').each(function () {
            var $input = $(this),
                $label = $input.next('label'),
                labelVal = $label.html();

            $input.on('change', function (e) {
                var fileName = '';

                if (this.files && this.files.length > 1)
                    fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
                else if (e.target.value)
                    fileName = e.target.value.split('\\').pop();

                if (fileName)
                    $label.find('span').html(fileName);
                else
                    $label.html(labelVal);
            });

            // Firefox bug fix

            $input
                .on('focus', function () {
                    $input.addClass('has-focus');
                })
                .on('blur', function () {
                    $input.removeClass('has-focus');
                });
        });
    })(jQuery, window, document);
});

$(window).on('load', async function () {

    const urlParams = new URLSearchParams(window.location.search)
    console.log(urlParams)
    const portfolio = urlParams.get('portfolio') || urlParams.get('pair') || undefined
    var values = urlParams.get('values') || 500

    try {
        document.title = `${portfolio.replace('_', ' ')}`
    } catch (error) {
        document.title = `${urlParams.get('pair')} details`
    }

    async function loadJSON(path) {
        return new Promise((resolve, reject) => {
            $.getJSON(path, function (data) {
                resolve(data)
            })
        })
    }

    /* -------------------- Navbar Scroll Setting -------------------- */

    $(window).scroll(function () {
        $(".navbar").toggleClass("scroll", $(this).scrollTop() > 50)
        $("#scroll-top").toggleClass("scroll", $(this).scrollTop() > 50)
    });

    /* -------------------- Select Box Setting -------------------- */

    $(".custom-select-box").each(function () {
        var classes = $(this).attr("class"),
            id = $(this).attr("id"),
            name = $(this).attr("name");
        var template = '<div class="' + classes + '">';
        template += '<span class="custom-select-box-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        $(this).find("option").each(function () {
            template += '<div id="OptText" class="option-text" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</div>';
        });
        template += '</div></div>';

        $(this).wrap('<div class="custom-select-box-wrapper"></div>');
        $(this).hide();
        $(this).after(template);
    });

    $(".custom-option:first-of-type").hover(function () {
        $(this).parents(".option-text").addClass("option-hover");
    }, function () {
        $(this).parents(".custom-options").removeClass("option-hover");
    });

    $(".custom-select-box-trigger").on("click", function () {
        $('html').one('click', function () {
            $(".custom-select-box").removeClass("opened");
        });
        $(this).parents(".custom-select-box").toggleClass("opened");
        event.stopPropagation();
    });

    $(".option-text").on("click", function () {
        $(this).parents(".custom-select-box-wrapper").find("select").val($(this).data("value"));
        $(this).parents(".custom-options").find(".option-text").removeClass("selection");
        $(this).addClass("selection");
        $(this).parents(".custom-select-box").removeClass("opened");
        $(this).parents(".custom-select-box").find(".custom-select-box-trigger").text($(this).text());
    });

    /* -------------------- Chart JS Setting -------------------- */
    var route = window.location.pathname

    const demo = urlParams.get('demo') === '1' || false
    console.log('is demo', demo)

    const platform = urlParams.get('platform') || 'coinbase'

    if (route === '/analytics') {
        generateCharts2()
        //setInterval(generateCharts2, 2 * 60 * 1000);

        async function generateCharts2() {
            try {
                if (demo) {
                    database = await fetch(`/history?v=32000&pair=${urlParams.get('id')}&platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    console.log('database length unfiltered', database.length)
                    data = await fetch(`/data.json?demo=1&pair=${urlParams.get('id')}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    data['indicator'] = urlParams.get('indicator')
                    products = await fetch(`/products?platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                } else {
                    database = await fetch(`/history?v=32000&pair=${portfolio}&platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    data = await fetch(`/data.json?pair=${portfolio}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    products = await fetch(`/products?pair=${portfolio}&platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                }
            } catch (error) {
                console.log(error)
                location.reload()
            }

            var transactions
            if (demo) {
                transactions = data[urlParams.get('indicator')][urlParams.get('rule')]['transactions']
                data['transactions'] = data[urlParams.get('indicator')][urlParams.get('rule')]['transactions'].map(item => {
                    item['created_at'] = item['timestamp']
                    item['side'] = item['type']
                    return item
                })
            } else transactions = data['transactions'].map(item => {
                item['created_at'] = item['timestamp']
                item['side'] = item['type']
                return item
            })
            console.log('database length', database.length)

            //latest 22 transactions
            if (!demo) transactions = transactions.slice(Math.max(transactions.length - 23, 0))

            //latest transaction at the top
            transactions = transactions.reverse()

            var tradingPair
            //if (!demo) tradingPair = data['tradingPair'].split('-')
            if (platform === 'coinbase') tradingPair = urlParams.get('pair').split('-')
            else {
                var pair = urlParams.get('pair') || urlParams.get('id')
                var details = (products.filter(item => item['symbol'] === pair))[0]
                console.log(details)
                tradingPair = `${details['baseAsset']}-${details['quoteAsset']}`.split('-')
            }
            console.log(tradingPair)
            try {
                document.title = `${portfolio.replace('_', ' ')} ${tradingPair.join('-')} ${data['indicator']}`
            } catch (error) {
                document.title = `${urlParams.get('id')} analytics`
            }

            var min5database = database.filter((x, i) => i % 5 == 0)
            var min15database = database.filter((x, i) => i % 15 == 0)
            var min25database = database.filter((x, i) => i % 25 == 0)

            var Min5indicators
            if (!demo) {
                Min5indicators = await fetch(`/indicators?pair=${portfolio}&granularity=${5}&values=${database.length}&indicator=${data['indicator']}&factor=${urlParams.get('factor') || 1}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            } else {
                Min5indicators = await fetch(`/indicators?pair=${urlParams.get('id')}&granularity=${5}&values=${database.length}&indicator=${urlParams.get('indicator')}&factor=${urlParams.get('factor')}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            }

            //Min5indicators = Min5indicators.filter((x, i) => i % 5 == 0) //every 2nd value
            Min5indicators = Min5indicators.slice(Min5indicators.length - min5database.length, Min5indicators.length)
            //min5database = min5database.slice(0, min5database.length - (Min5indicators.filter(item => !item['fifityfive'])).length)

            console.log(Min5indicators.length, min5database.length)

            var Min15indicators
            if (!demo) {
                Min15indicators = await fetch(`/indicators?pair=${portfolio}&granularity=${15}&values=${database.length}&indicator=${data['indicator']}&factor=${urlParams.get('factor') || 1}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            } else {
                Min15indicators = await fetch(`/indicators?pair=${urlParams.get('id')}&granularity=${15}&values=${database.length}&indicator=${urlParams.get('indicator')}&factor=${urlParams.get('factor')}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            }

            //Min15indicators = Min15indicators.filter((x, i) => i % 15 == 0) //every 2nd value
            Min15indicators = Min15indicators.slice(Min15indicators.length - min15database.length, Min15indicators.length)

            console.log(Min15indicators.length, min15database.length)

            var Min25indicators
            if (!demo) {
                Min25indicators = await fetch(`/indicators?pair=${portfolio}&granularity=${25}&values=${database.length}&indicator=${data['indicator']}&factor=${urlParams.get('factor') || 1}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            } else {
                Min25indicators = await fetch(`/indicators?pair=${urlParams.get('id')}&granularity=${25}&values=${database.length}&indicator=${urlParams.get('indicator')}&factor=${urlParams.get('factor')}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            }

            //Min25indicators = Min25indicators.filter((x, i) => i % 25 == 0) //every 2nd value
            Min25indicators = Min25indicators.slice(Min25indicators.length - min25database.length, Min25indicators.length)
            //min25database = min25database.slice(0 + 7, min25database.length)

            console.log(Min25indicators.length, min25database.length)

            //console.log(data)
            //console.log(data['transactions'])

            if (!demo && false) {
                $('#volume').text(Number(data['stats']['volume']).toFixed(2))

                $('#24Highest').text(data['stats']['high'])
                $('#24Highest2').text(data['stats']['high'])
                $('#24Highest3').text(data['stats']['high'])
                $('#24Highest4').text(data['stats']['high'])

                $('#24Lowest').text(data['stats']['low'])
                $('#24Lowest2').text(data['stats']['low'])
                $('#24Lowest3').text(data['stats']['low'])
                $('#24Lowest4').text(data['stats']['low'])

                $('#volatility').text(Number(Number(data['stats']['volatility']) * 100).toFixed(2).toString() + '%')
                $('#volatility2').text(Number(Number(data['stats']['volatility']) * 100).toFixed(2).toString() + '%')
                $('#volatility3').text(Number(Number(data['stats']['volatility']) * 100).toFixed(2).toString() + '%')
                $('#volatility4').text(Number(Number(data['stats']['volatility']) * 100).toFixed(2).toString() + '%')

                $('#lastChange').text('none')
                $('#lastChange2').text('none')
                $('#lastChange3').text('none')
                $('#lastChange4').text('none')

                $('#lastPrice').text(data['stats']['product']['price'])
                $('#lastPrice2').text(data['stats']['product']['price'])
                $('#lastPrice3').text(data['stats']['product']['price'])
                $('#lastPrice4').text(data['stats']['product']['price'])
            }

            //console.log('database length', database.length)
            //console.log('min5 length', Min5indicators.length, database.filter((x, i) => i % 5 == 0).length)
            //console.log('min15 length', Min15indicators.length, database.filter((x, i) => i % 15 == 0).length)
            //console.log('min25 length', Min25indicators.length, database.filter((x, i) => i % 25 == 0).length)

            //console.log('5 min indicators length', Min5indicators.length, database.length, database.filter((x, i) => i % 5 == 0).length)

            var profits = data['profits']
            if (demo) profits = data[urlParams.get('indicator')][urlParams.get('rule')]['profits']

            var dataset = [{
                    label: 'Price',
                    data: min5database.map((item) => {
                        return item['price']
                    }),
                    borderColor: '#314DED',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 8`,
                    data: Min5indicators.map((item) => {
                        return item['eight']
                    }),
                    borderColor: '#b700ff',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    fill: false,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 13`,
                    data: Min5indicators.map((item) => {
                        return item['thirteen']
                    }),
                    borderColor: '#37ff00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 21`,
                    data: Min5indicators.map((item) => {
                        return item['twentyone']
                    }),
                    borderColor: '#ffdd00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                }
            ]

            console.log(tradingPair, tradingPair.join('-'))
            const {
                difference
            } = await fetch(`/maxmin?pair=${tradingPair.join('-')}&platform=${platform}`)
                .then(async resp => {
                    return await resp.json()
                })
            const zehntel = (difference - 1) * 0.1
            console.log(difference, zehntel)

            for (var a in data['transactions']) {
                if (!data['transactions'][a] || !data['transactions'][a]['created_at']) {
                    console.log('transaction data not valid', data['transactions'][a])
                } else {
                    var firsTime = new Date(data['transactions'][a]['created_at']).getTime()
                    //if (demo) firsTime = new Date(data['transactions'][a]['created_at']).getTime()
                    var returnedValue = false
                    for (var b in min5database) {
                        var secondTime = new Date(Number(min5database[b]['time'])).getTime()
                        var startRange = new Date(secondTime)
                        startRange.setMinutes(startRange.getMinutes() - 5)

                        var endRange = new Date(secondTime)
                        endRange.setMinutes(endRange.getMinutes() + 5)
                        if (firsTime > startRange.getTime() && firsTime < endRange.getTime() && !returnedValue) {
                            console.log(`Found transactions for ${data['transactions'][a]['side']}`, data['transactions'][a])
                            var object = {
                                label: 'Buy',
                                data: min5database.map((item) => {
                                    var thirdTime = new Date(Number(item['time'])).getTime()
                                    if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime() && !returnedValue) {
                                        returnedValue = true
                                        return data['transactions'][a]['price']
                                    } else return null
                                }),
                                borderColor: '#15d649',
                                //borderWidth: 1,
                                type: 'line',
                                lineTension: 0,
                                borderWidth: 4,
                                pointRadius: 4,
                                fill: false
                            }
                            if (data['transactions'][a]['side'] === 'sell') {
                                console.log('setting label to sell')
                                object['label'] = 'Sell'
                                object['borderColor'] = '#eb1109'
                                if (!data['transactions'][a]['moving']) {
                                    dataset.unshift(object)
                                    continue
                                }
                                startRange.setMinutes(startRange.getMinutes() - 5 * 10)
                                endRange.setMinutes(endRange.getMinutes() + 5 * 10)
                                dataset.unshift({
                                    label: 'Tunnel',
                                    data: min5database.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                            //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                            return Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5)
                                        } else return null
                                    }),
                                    borderColor: '#a8a8a8',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 1,
                                    pointRadius: 1,
                                    fill: false
                                })
                                dataset.unshift({
                                    label: 'Tunnel',
                                    data: min5database.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                            //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                            return Number(data['transactions'][a]['moving']) * (1 + zehntel * 0.5)
                                        } else return null
                                    }),
                                    borderColor: '#a8a8a8',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 1,
                                    pointRadius: 1,
                                    fill: false
                                })
                            }
                            dataset.unshift(object)
                        }
                    }
                }
            }

            /* Graph One */

            var gchartOne = document.getElementById('GraphOne').getContext('2d');

            var myChart = new Chart(gchartOne, {
                data: {
                    labels: min5database.map((item) => {
                        var time = new Date(Number(item['time']));
                        return time.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }),
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
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }, {
                            display: false,
                            id: 'B',
                            position: 'right',
                            gridLines: {
                                color: '#46496c',
                            },

                            ticks: {
                                //stepSize: 4500,
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false,
                                max: Number(await getMaxValue(database.filter((x, i) => i % 5 == 0).map((item) => {
                                    return item['volume']
                                }))) * 2.5
                            }
                        }]
                    }
                }
            });

            Min15indicators = Min15indicators.slice(Min15indicators.length - Min15indicators.length / 5, Min15indicators.length)


            dataset = [{
                    label: 'Price',
                    data: Min15indicators.map((item) => {
                        return item['price']
                    }),
                    borderColor: '#314DED',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 8`,
                    data: Min15indicators.map((item) => {
                        return item['eight']
                    }),
                    borderColor: '#b700ff',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    fill: false,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 13`,
                    data: Min15indicators.map((item) => {
                        return item['thirteen']
                    }),
                    borderColor: '#37ff00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 21`,
                    data: Min15indicators.map((item) => {
                        return item['twentyone']
                    }),
                    borderColor: '#ffdd00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 55`,
                    data: Min15indicators.map((item) => {
                        return item['fiftyfive']
                    }),
                    borderColor: '#e30000',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                }
            ]

            console.log(data['transactions'])

            for (var a in data['transactions']) {
                if (!data['transactions'][a] || !data['transactions'][a]['created_at']) {
                    console.log('transaction data not valid', data['transactions'][a])
                } else {
                    var firsTime = new Date(data['transactions'][a]['created_at']).getTime()
                    var returnedValue = false
                    for (var b in Min15indicators) {
                        var secondTime = new Date(Number(Min15indicators[b]['time'])).getTime()
                        var startRange = new Date(secondTime)
                        startRange.setMinutes(startRange.getMinutes() - 15)

                        var endRange = new Date(secondTime)
                        endRange.setMinutes(endRange.getMinutes() + 15)
                        if (firsTime > startRange.getTime() && firsTime < endRange.getTime() && !returnedValue) {
                            console.log(`Found transactions for ${data['transactions'][a]['side']}`, data['transactions'][a])
                            var object = {
                                label: 'Buy',
                                data: Min15indicators.map((item) => {
                                    var thirdTime = new Date(Number(item['time'])).getTime()
                                    if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime() && !returnedValue) {
                                        returnedValue = true
                                        return data['transactions'][a]['price']
                                    } else return null
                                }),
                                borderColor: '#15d649',
                                //borderWidth: 1,
                                type: 'line',
                                lineTension: 0,
                                borderWidth: 4,
                                pointRadius: 4,
                                fill: false
                            }
                            if (data['transactions'][a]['side'] === 'sell') {
                                console.log('setting label to sell')
                                object['label'] = 'Sell'
                                object['borderColor'] = '#eb1109'
                                if (!data['transactions'][a]['moving']) {
                                    dataset.unshift(object)
                                    continue
                                }
                                startRange.setMinutes(startRange.getMinutes() - 15 * 10)
                                endRange.setMinutes(endRange.getMinutes() + 15 * 10)
                                dataset.unshift({
                                    label: 'Tunnel',
                                    data: Min15indicators.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                            //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                            return Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5)
                                        } else return null
                                    }),
                                    borderColor: '#a8a8a8',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 1,
                                    pointRadius: 1,
                                    fill: false
                                })
                                dataset.unshift({
                                    label: 'Tunnel',
                                    data: Min15indicators.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                            //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                            return Number(data['transactions'][a]['moving']) * (1 + zehntel * 0.5)
                                        } else return null
                                    }),
                                    borderColor: '#a8a8a8',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 1,
                                    pointRadius: 1,
                                    fill: false
                                })
                            }
                            dataset.unshift(object)
                        }
                    }
                }
            }

            /* Graph Two */

            var gchartTwo = document.getElementById('GraphTwo').getContext('2d');

            var myChart = new Chart(gchartTwo, {
                data: {
                    labels: Min15indicators.map((item) => {
                        var time = new Date(Number(item['time']));
                        return time.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }),
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
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }]
                    }
                }
            });

            dataset = [{
                    label: 'Price',
                    data: min25database.map((item) => {
                        return item['price']
                    }),
                    borderColor: '#314DED',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 8`,
                    data: Min25indicators.map((item) => {
                        return item['eight']
                    }),
                    borderColor: '#b700ff',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    fill: false,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 13`,
                    data: Min25indicators.map((item) => {
                        return item['thirteen']
                    }),
                    borderColor: '#37ff00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 21`,
                    data: Min25indicators.map((item) => {
                        return item['twentyone']
                    }),
                    borderColor: '#ffdd00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 55`,
                    data: Min25indicators.map((item) => {
                        return item['fiftyfive']
                    }),
                    borderColor: '#e30000',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                }
            ]

            /* Graph Three */

            for (var a in data['transactions']) {
                if (!data['transactions'][a] || !data['transactions'][a]['created_at']) {
                    console.log('transaction data not valid', data['transactions'][a])
                } else {
                    var firsTime = new Date(data['transactions'][a]['created_at']).getTime()
                    var returnedValue = false
                    for (var b in min25database) {
                        var secondTime = new Date(Number(min25database[b]['time'])).getTime()
                        var startRange = new Date(secondTime)
                        startRange.setMinutes(startRange.getMinutes() - 27)

                        var endRange = new Date(secondTime)
                        endRange.setMinutes(endRange.getMinutes() + 27)
                        if (firsTime > startRange.getTime() && firsTime < endRange.getTime() && !returnedValue) {
                            console.log(`Found transactions for ${data['transactions'][a]['side']}`, data['transactions'][a])
                            var object = {
                                label: 'Buy',
                                data: min25database.map((item) => {
                                    var thirdTime = new Date(Number(item['time'])).getTime()
                                    if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime() && !returnedValue) {
                                        returnedValue = true
                                        return data['transactions'][a]['price']
                                    } else return null
                                }),
                                borderColor: '#15d649',
                                //borderWidth: 1,
                                type: 'line',
                                lineTension: 0,
                                borderWidth: 4,
                                pointRadius: 4,
                                fill: false
                            }
                            if (data['transactions'][a]['side'] === 'sell') {
                                console.log('setting label to sell')
                                object['label'] = 'Sell'
                                object['borderColor'] = '#eb1109'
                                if (!data['transactions'][a]['moving']) {
                                    dataset.unshift(object)
                                    continue
                                }
                                startRange.setMinutes(startRange.getMinutes() - 25 * 10)
                                endRange.setMinutes(endRange.getMinutes() + 25 * 10)
                                dataset.unshift({
                                    label: 'Tunnel',
                                    data: min25database.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                            //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                            return Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5)
                                        } else return null
                                    }),
                                    borderColor: '#a8a8a8',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 1,
                                    pointRadius: 1,
                                    fill: false
                                })
                                dataset.unshift({
                                    label: 'Tunnel',
                                    data: min25database.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                            //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                            return Number(data['transactions'][a]['moving']) * (1 + zehntel * 0.5)
                                        } else return null
                                    }),
                                    borderColor: '#a8a8a8',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 1,
                                    pointRadius: 1,
                                    fill: false
                                })
                            }
                            dataset.unshift(object)
                        }
                    }
                }
            }

            var gchartFour = document.getElementById('GraphThree').getContext('2d');

            var myChart = new Chart(gchartFour, {
                data: {
                    labels: min25database.map((item) => {
                        var time = new Date(Number(item['time']));
                        return time.toLocaleTimeString([], {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }),
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
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }, {
                            display: false,
                            id: 'B',
                            position: 'right',
                            gridLines: {
                                color: '#46496c',
                            },

                            ticks: {
                                //stepSize: 4500,
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false,
                                max: Number(await getMaxValue(database.map((item) => {
                                    return item['volume']
                                }))) * 2.5
                            }
                        }]
                    }
                }
            });

            /* Graph Four */

            var ctx = document.getElementById("GraphFour").getContext('2d');

            if (demo && !urlParams.get('profit')) {
                const rule = parseInt(urlParams.get('rule'))
                $('#pills-graph-four-tab').text(`${rule} MIN CHART`)
                var graphFourIndicators = await fetch(`/indicators?pair=${urlParams.get('id')}&granularity=${rule}&values=${database.length}&indicator=${urlParams.get('indicator')}&factor=${urlParams.get('factor')}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
                //var graphFourDatabase = database.filter((x, i) => i % rule == 0)
                //graphFourIndicators = graphFourIndicators.slice(graphFourIndicators.length - graphFourDatabase.length, graphFourIndicators.length)
                //graphFourDatabase = graphFourDatabase.slice(graphFourDatabase.length - graphFourIndicators.length, graphFourDatabase.length)

                if (rule === 1 || rule === 5) {
                    graphFourIndicators = graphFourIndicators.slice(graphFourIndicators.length - graphFourIndicators.length / 2, graphFourIndicators.length)
                    //graphFourDatabase = graphFourDatabase.slice(graphFourDatabase.length - graphFourIndicators.length, graphFourDatabase.length)
                }
                //if (true) graphFourIndicators = graphFourIndicators.slice(graphFourIndicators.length - graphFourIndicators.length / 4, graphFourIndicators.length)

                dataset = [{
                        label: 'Price',
                        data: graphFourIndicators.map((item) => {
                            return item['price']
                        }),
                        borderColor: '#314DED',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        yAxisID: 'A'
                    },
                    {
                        label: `${data['indicator']} 8`,
                        data: graphFourIndicators.map((item) => {
                            return item['eight']
                        }),
                        borderColor: '#b700ff',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        fill: false,
                        yAxisID: 'A'
                    },
                    {
                        label: `${data['indicator']} 13`,
                        data: graphFourIndicators.map((item) => {
                            return item['thirteen']
                        }),
                        borderColor: '#37ff00',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        yAxisID: 'A',
                        fill: false
                    },
                    {
                        label: `${data['indicator']} 21`,
                        data: graphFourIndicators.map((item) => {
                            return item['twentyone']
                        }),
                        borderColor: '#ffdd00',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        yAxisID: 'A',
                        fill: false
                    },
                    {
                        label: `${data['indicator']} 55`,
                        data: graphFourIndicators.map((item) => {
                            return item['fiftyfive']
                        }),
                        borderColor: '#e30000',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        yAxisID: 'A',
                        fill: false
                    }
                ]

                //HeikinAshi

                for (var a in data['transactions']) {
                    if (!data['transactions'][a] || !data['transactions'][a]['created_at']) {
                        console.log('transaction data not valid', data['transactions'][a])
                    } else {
                        var firsTime = new Date(data['transactions'][a]['created_at']).getTime()
                        var returnedValue = false
                        for (var b in graphFourIndicators) {
                            var secondTime = new Date(Number(graphFourIndicators[b]['time'])).getTime()
                            var startRange = new Date(secondTime)
                            startRange.setMinutes(startRange.getMinutes() - rule * 1.5)

                            var endRange = new Date(secondTime)
                            endRange.setMinutes(endRange.getMinutes() + rule * 1.5)
                            if (firsTime > startRange.getTime() && firsTime < endRange.getTime() && !returnedValue) {
                                //console.log(`Found transactions for ${data['transactions'][a]['side']}`, data['transactions'][a])
                                var object = {
                                    label: 'Buy',
                                    data: graphFourIndicators.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime() && !returnedValue) {
                                            returnedValue = true
                                            return data['transactions'][a]['price']
                                        } else return null
                                    }),
                                    borderColor: '#15d649',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 4,
                                    pointRadius: 4,
                                    fill: false
                                }
                                if (data['transactions'][a]['side'] === 'sell') {
                                    //console.log('setting label to sell')
                                    object['label'] = 'Sell'
                                    object['borderColor'] = '#eb1109'
                                    if (!data['transactions'][a]['moving']) {
                                        dataset.unshift(object)
                                        continue
                                    }
                                    startRange.setMinutes(startRange.getMinutes() - rule * 10)
                                    endRange.setMinutes(endRange.getMinutes() + rule * 10)
                                    dataset.unshift({
                                        label: 'Tunnel',
                                        data: graphFourIndicators.map((item) => {
                                            var thirdTime = new Date(Number(item['time'])).getTime()
                                            if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                                //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                                return Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5)
                                            } else return null
                                        }),
                                        borderColor: '#a8a8a8',
                                        //borderWidth: 1,
                                        type: 'line',
                                        lineTension: 0,
                                        borderWidth: 1,
                                        pointRadius: 1,
                                        fill: false
                                    })
                                    dataset.unshift({
                                        label: 'Tunnel',
                                        data: graphFourIndicators.map((item) => {
                                            var thirdTime = new Date(Number(item['time'])).getTime()
                                            if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime()) {
                                                //console.log('test', data['transactions'][a]['moving'], Number(data['transactions'][a]['moving']) * (1 - zehntel * 0.5))
                                                return Number(data['transactions'][a]['moving']) * (1 + zehntel * 0.5)
                                            } else return null
                                        }),
                                        borderColor: '#a8a8a8',
                                        //borderWidth: 1,
                                        type: 'line',
                                        lineTension: 0,
                                        borderWidth: 1,
                                        pointRadius: 1,
                                        fill: false
                                    })
                                }
                                dataset.unshift(object)
                            }
                        }
                    }
                }

                var myChart = new Chart(ctx, {
                    data: {
                        labels: graphFourIndicators.map((item) => {
                            var time = new Date(Number(item['time']));
                            return time.toLocaleTimeString([], {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        }),
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
                                },

                                ticks: {
                                    fontColor: "#9097b9",
                                    fontSize: 12,
                                    beginAtZero: false
                                }
                            }, {
                                //display: false,
                                id: 'B',
                                position: 'right',
                                gridLines: {
                                    color: '#46496c',
                                },

                                ticks: {
                                    //stepSize: 4500,
                                    fontColor: "#9097b9",
                                    fontSize: 12,
                                    beginAtZero: false,
                                }
                            }]
                        }
                    }
                });
            } else {
                var barChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: profits.map((item) => {
                            var time = new Date(item['timestamp']);
                            return time.toLocaleTimeString([], {
                                weekday: 'short',
                                hour: '2-digit',
                            })
                        }),
                        datasets: [{
                            label: 'Profit in %',
                            data: profits.map((item, a) => {
                                var until = 1
                                for (var b = 0; b <= a && b < profits.length; b++) {
                                    until = Number(until) * (1 + Number(profits[b]['profit']))
                                }
                                return ((until - 1) * 100).toFixed(2)
                            }),
                            backgroundColor: "#0075cf",
                            borderColor: "#0091ff",
                            borderWidth: 1,
                        }]
                    },
                    options: {
                        legend: {
                            display: false,
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    color: '#46496c',
                                },

                                ticks: {
                                    fontColor: "#9097b9",
                                    fontSize: 12,
                                    beginAtZero: false
                                }
                            }],
                            yAxes: [{
                                gridLines: {
                                    color: '#46496c',
                                },

                                ticks: {
                                    fontColor: "#9097b9",
                                    fontSize: 12,
                                    beginAtZero: false
                                }
                            }]
                        }
                    }
                });
            }

            //mini side charts
            //tradingPair
            const base = tradingPair[0]
            const exchange = tradingPair[1]

            console.log(base, exchange)

            const baseBalance = data['balance']
            const exchangeBalance = data['native_balance']

            console.log(baseBalance, exchangeBalance)

            var currencyPair = await findPair(base, true)
                .catch(async e => {
                    return 'BTC-EUR'
                })

            console.log('found currency pair', currencyPair)

            var gchartFive = document.getElementById('GraphFive').getContext('2d');

            dataset = await fetch(`/history?v=1500&pair=${currencyPair}&platform=${platform}`)
                .then(async resp => {
                    return await resp.json()
                })

            $('#exchangeRatePair').text(currencyPair.replace('-', ' / '))
            $('#exchangeRatePrice').text(dataset[dataset.length - 1]['price'])
            //onclick="window.open('https://de.tradingview.com/symbols/${id.replace('-', '')}/?exchange=COINBASE', 'mywindow')"
            $('#exchangeRateButton').attr('onclick', `window.open('https://de.tradingview.com/symbols/${currencyPair.replace('-', '')}/?exchange=${platform.toUpperCase()}', 'mywindow')`)

            var myChart = new Chart(gchartFive, {
                data: {
                    labels: dataset.filter((x, i) => i % 5 == 0).map((item) => {
                        var time = new Date(Number(item['time']));
                        return time.toLocaleTimeString([], {
                            //weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }),
                    datasets: [{
                        label: 'Graph',
                        data: dataset.filter((x, i) => i % 5 == 0).map(item => item['price']),
                        borderColor: '#314DED',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        yAxisID: 'A'
                    }],
                },
                options: {
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: '#46496c',
                            },
                            ticks: {
                                maxTicksLimit: 10,
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
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }]
                    }
                }
            });


            currencyPair = await findPair(exchange, true)
                .catch(async e => {
                    return 'ETH-BTC'
                })

            dataset = await fetch(`/history?v=1500&pair=${currencyPair}&platform=${platform}`)
                .then(async resp => {
                    return await resp.json()
                })

            var gchartSix = document.getElementById('GraphSix').getContext('2d');

            $('#exchangeRatePair2').text(currencyPair.replace('-', ' / '))
            $('#exchangeRatePrice2').text(dataset[dataset.length - 1]['price'])
            //onclick="window.open('https://de.tradingview.com/symbols/${id.replace('-', '')}/?exchange=COINBASE', 'mywindow')"
            $('#exchangeRateButton2').attr('onclick', `window.open('https://de.tradingview.com/symbols/${currencyPair.replace('-', '')}/?exchange=COINBASE', 'mywindow')`)

            var myChart = new Chart(gchartSix, {
                data: {
                    labels: dataset.filter((x, i) => i % 5 == 0).map((item) => {
                        var time = new Date(Number(item['time']));
                        return time.toLocaleTimeString([], {
                            //weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }),
                    datasets: [{
                        label: 'Graph',
                        data: dataset.filter((x, i) => i % 5 == 0).map(item => item['price']),
                        borderColor: '#314DED',
                        borderWidth: 2,
                        type: 'line',
                        lineTension: 0.2,
                        pointRadius: 0,
                        yAxisID: 'A'
                    }],
                },
                options: {
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: '#46496c',
                            },
                            ticks: {
                                maxTicksLimit: 10,
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
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }]
                    }
                }
            });


            async function findPair(currency, exact) {
                return new Promise((resolve, reject) => {
                    if (tradingPair.join('-').includes('EUR')) {
                        reject()
                        return
                    }
                    for (var a in products) {
                        //console.log(products[a]['id'])
                        if (products[a]['id'].includes(currency) && products[a]['id'].includes('EUR') && exact) {
                            resolve(products[a]['id'])
                            break
                        } else if (products[a]['id'].includes(currency) && !exact) {
                            console.log('find pair with more steps')
                            break
                        }
                    }
                    reject()
                })
            }
        }
    } else if (route === '/') {
        generateCharts()
        setInterval(generateCharts, 2 * 60 * 1000);

        async function generateCharts() {
            try {
                if (demo) {
                    database = await fetch(`/history?v=28000&pair=${urlParams.get('id')}&platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    console.log('database length unfiltered', database.length)
                    data = await fetch(`/data.json?demo=1&pair=${urlParams.get('id')}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    data['indicator'] = urlParams.get('indicator')
                    data['profits'] = data[urlParams.get('indicator')][urlParams.get('rule')]['profits']
                    products = await fetch(`/products?platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                } else {
                    database = await fetch(`/history?v=28000&portfolio=${portfolio}&platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    data = await fetch(`/data.json?portfolio=${portfolio}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                    products = await fetch(`/products?platform=${platform}`)
                        .then(async resp => {
                            return await resp.json()
                        })
                }
            } catch (error) {
                console.log(error)
                location.reload()
            }

            //console.log(data)
            //console.log(data['transactions'])
            var tradingPair
            if (!demo) tradingPair = data['tradingPair'].split('-')
            else tradingPair = urlParams.get('id').split('-')

            try {
                document.title = `${portfolio.replace('_', ' ')} ${data['tradingPair']}`
            } catch (error) {
                document.title = `${urlParams.get('pair')} details`
            }

            $('#baseCurrency').attr("placeholder", tradingPair[0])
            $('#secondCurrency').attr("placeholder", tradingPair[1])

            if (!demo) {
                $('#volume').text(Number(data['stats']['volume']).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                $('#24Highest').text(data['stats']['high'])
                $('#24Lowest').text(data['stats']['low'])
                $('#volatility').text(Number(Number(data['stats']['volatility']) * 100).toFixed(2).toString() + '%')
                $('#lastChange').text('none')
                $('#lastPrice').text(data['stats']['product']['price'])
            }

            var generalProfit = Number((data['profit'] - 1) * 100).toFixed(2)
            $('#generalProfit').text(generalProfit.toString() + '%')
            if (generalProfit < 0) $('#generalProfit').addClass('color-red')
            else $('#generalProfit').addClass('color-green')

            if (!demo && data['sold']['timestamp'] < data['bought']['timestamp']) {
                $('#liveProfit').text(Number(data['liveProfit'] * 100).toFixed(2).toString() + '%')

                if (data['liveProfit'] < 0) $('#liveProfit').addClass('color-red')
                else $('#liveProfit').addClass('color-green')
            } else if (!demo) {
                $('#liveProfit').text('buy is next')
                $('#liveProfit').addClass('color-secondary')
            }

            if (data['profits']) {
                var date = new Date()
                date.setHours(date.getHours() - date.getHours())
                date.setMinutes(date.getMinutes() - date.getMinutes())

                var dailyProfit = undefined
                console.log(data['profits'])
                for (var a in data['profits']) {
                    //console.log(data['profits'][a])
                    //var profitTimestamp = new Date(data['profits'][a]['timestamp'])
                    if (date.getTime() < data['profits'][a]['timestamp']) {
                        console.log('inside daily profit calculator', data['profits'][a]['profit'])
                        if (dailyProfit) {
                            //console.log('is dailyProfit', 1 + Number(data['profits'][a]['profit']))
                            dailyProfit = dailyProfit * (1 + Number(data['profits'][a]['profit']))
                        } else {
                            //console.log('is dailyProfit', 1 + Number(data['profits'][a]['profit']))
                            dailyProfit = 1 + Number(data['profits'][a]['profit'])
                        }
                    }
                }

                dailyProfit = Number(Number(dailyProfit - 1) * 100).toFixed(2).toString()

                $('#todaysProfit').text(dailyProfit + '%')
                if (dailyProfit < 0) $('#todaysProfit').addClass('color-red')
                else $('#todaysProfit').addClass('color-green')
            }
            //database = database.filter((x, i) => i % 2) //every 2nd value
            //database = database.slice(database.length - 301, database.length - 1)
            var granularity = Number(urlParams.get('granularity')) || 1
            if (!demo) {
                indicators = await fetch(`/indicators?portfolio=${portfolio}&granularity=${granularity}&values=${database.length}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            } else {
                indicators = await fetch(`/indicators?pair=${urlParams.get('id')}&granularity=${granularity || '1'}&values=${database.length}&indicator=${urlParams.get('indicator')}&factor=${urlParams.get('factor')}&platform=${platform}`)
                    .then(async resp => {
                        return await resp.json()
                    })
            }

            //transactions

            //sells
            var transactions
            if (demo) {
                transactions = data[urlParams.get('indicator')][urlParams.get('rule')]['transactions']
                data['transactions'] = data[urlParams.get('indicator')][urlParams.get('rule')]['transactions'].map(item => {
                    item['created_at'] = item['timestamp']
                    item['side'] = item['type']
                    return item
                })
            } else transactions = data['transactions']
            //latest 22 transactions
            transactions = transactions.slice(Math.max(transactions.length - 23, 0))

            //latest transaction at the top
            transactions = transactions.reverse()

            var totalAmountSell = 0
            var totalAmountBuy = 0

            try {
                $('#sellTransactions').empty()
                $('#buyTransactions').empty()
            } catch (error) {
                console.log(error)
            }

            for (var a in transactions) {
                console.log('transaction', a, transactions[a])
                var product = transactions[a]['product_id']
                if (demo) product = tradingPair.join('-')
                var baseCurrency = product.split('-')[0]
                var currency = product.split('-')[1]

                $('#baseCurrency').text(baseCurrency)
                $('#baseCurrency2').text(baseCurrency)
                $('#product').text(product)
                $('#product2').text(product)

                if (transactions[a] !== null) {
                    if (transactions[a]['side'] === 'sell') {

                        var profit = 'NaN'

                        var profitColor = 'color-white'

                        totalAmountSell += Number(transactions[a]['size'])

                        console.log('sell transaction', transactions[a])

                        data['profits'].map(item => {
                            if (item['orderID'] === transactions[a]['id']) profit = (item['profit'] * 100).toFixed(2)
                        })

                        if (profit < 0) profitColor = 'color-red'
                        else profitColor = 'color-green'

                        var status = transactions[a]['status']
                        if (demo) status = 'demo'
                        if (transactions[a]['done_reason']) status = transactions[a]['done_reason']

                        //profit / amount / price / status
                        $('#sellTransactions').append(`<tr id="${transactions[a]['id']}">
                <td class="first-col ${profitColor}">
                    ${profit.toString() + '%'}
                </td>
                <td class="second-col">
                    ${Number(transactions[a]['size']).toFixed(2)}
                </td>
                <td class="third-col">
                    ${Number(transactions[a]['price']).toFixed(8)}
                </td>
                <td class="fourth-col">
                    ${status.toUpperCase()}
                </td>
            </tr>`)
                        if (status !== 'done' && status !== 'demo') $(`#${transactions[a]['id']}`).css('opacity', '20%')

                    } else if (transactions[a]['side'] === 'buy') {

                        totalAmountBuy += Number(transactions[a]['size'])
                        var status = transactions[a]['status']
                        if (transactions[a]['done_reason']) status = transactions[a]['done_reason']
                        else if (demo) status = 'demo'
                        //profit / amount / price / status
                        $('#buyTransactions').append(`<tr id="${transactions[a]['id']}">
                <td class="first-col">
                    ${new Date(transactions[a]['created_at']).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td class="second-col">
                    ${Number(transactions[a]['size']).toFixed(2)}
                </td>
                <td class="third-col">
                    ${Number(transactions[a]['price']).toFixed(8)}
                </td>
                <td class="fourth-col">
                    ${status.toUpperCase()}
                </td>
            </tr>`)

                        if (status !== 'done' && status !== 'demo') $(`#${transactions[a]['id']}`).css('opacity', '20%')
                    }
                }

                $('#totalText').text(`Total ${baseCurrency}: ${Number(totalAmountSell).toFixed(2)}`)
                $('#totalText2').text(`Total ${baseCurrency}: ${Number(totalAmountBuy).toFixed(2)}`)
            }

            /* Graph Favourite Green */

            var gchart = document.getElementById('GraphFavouriteGreen').getContext('2d');

            var myChart = new Chart(gchart, {
                data: {
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{
                        label: 'Graph',
                        data: [65, 59, 90, 81, 56],
                        borderColor: '#51f396',
                        borderWidth: 1,
                        type: 'line',
                        lineTension: 0,
                        borderWidth: 2,
                        pointRadius: 2,
                    }],
                },
                options: {
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                            },

                            ticks: {
                                display: false,
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: false,
                            },

                            ticks: {
                                display: false,
                            }
                        }]
                    }
                }
            });

            /* Graph Favourite Red */

            var gchart = document.getElementById('GraphFavouriteRed').getContext('2d');

            var myChart = new Chart(gchart, {
                data: {
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{
                        label: 'Graph',
                        data: [65, 59, 90, 81, 56],
                        borderColor: '#e23b55',
                        borderWidth: 1,
                        type: 'line',
                        lineTension: 0,
                        borderWidth: 2,
                        pointRadius: 2,
                    }],
                },
                options: {
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                            },

                            ticks: {
                                display: false,
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: false,
                            },

                            ticks: {
                                display: false,
                            }
                        }]
                    }
                }
            });

            /* Graph Chart */

            var gchart = document.getElementById('GraphChart').getContext('2d');


            var dataset = [{
                    label: 'Price',
                    data: database.filter((x, i) => i % granularity == 0).map((item) => {
                        return item['price']
                    }),
                    borderColor: '#314DED',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 8`,
                    data: indicators.filter((x, i) => i % granularity == 0).map((item) => {
                        return item['eight']
                    }),
                    borderColor: '#b700ff',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    fill: false,
                    yAxisID: 'A'
                },
                {
                    label: `${data['indicator']} 13`,
                    data: indicators.filter((x, i) => i % granularity == 0).map((item) => {
                        return item['thirteen']
                    }),
                    borderColor: '#37ff00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 21`,
                    data: indicators.filter((x, i) => i % granularity == 0).map((item) => {
                        return item['twentyone']
                    }),
                    borderColor: '#ffdd00',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                },
                {
                    label: `${data['indicator']} 55`,
                    data: indicators.filter((x, i) => i % granularity == 0).map((item) => {
                        return item['fiftyfive']
                    }),
                    borderColor: '#e30000',
                    borderWidth: 2,
                    type: 'line',
                    lineTension: 0.2,
                    pointRadius: 0,
                    yAxisID: 'A',
                    fill: false
                }
            ]

            if (granularity === 1) {
                for (var a in data['transactions']) {
                    if (!data['transactions'][a] || !data['transactions'][a]['created_at']) {
                        console.log('transaction data not valid', data['transactions'][a])
                    } else {
                        var firsTime = new Date(data['transactions'][a]['created_at']).getTime()

                        var returnedValue = false
                        for (var b in database) {
                            var secondTime = new Date(Number(database[b]['time'])).getTime()
                            var startRange = new Date(secondTime)
                            startRange.setSeconds(startRange.getSeconds() - 90)

                            var endRange = new Date(secondTime)
                            endRange.setSeconds(endRange.getSeconds() + 90)
                            //console.log(firsTime > startRange.getTime() && firsTime < endRange.getTime())
                            //console.log(startRange, endRange)
                            if (firsTime > startRange.getTime() && firsTime < endRange.getTime()) {
                                console.log(`Found transactions for ${data['transactions'][a]['side']}`, data['transactions'][a])
                                var object = {
                                    label: 'Buy',
                                    data: database.map((item) => {
                                        var thirdTime = new Date(Number(item['time'])).getTime()
                                        if (thirdTime > startRange.getTime() && thirdTime < endRange.getTime() && !returnedValue) {
                                            returnedValue = true
                                            return data['transactions'][a]['price']
                                        } else return null
                                    }),
                                    borderColor: '#15d649',
                                    //borderWidth: 1,
                                    type: 'line',
                                    lineTension: 0,
                                    borderWidth: 4,
                                    pointRadius: 4,
                                    fill: false
                                }
                                if (data['transactions'][a]['side'] === 'sell') {
                                    console.log('setting label to sell')
                                    object['label'] = 'Sell'
                                    object['borderColor'] = '#eb1109'
                                }
                                dataset.unshift(object)
                            }
                        }
                    }
                }
            }

            if (!demo && data['sold']['timestamp'] < data['bought']['timestamp']) {
                //sell is next
                dataset.push({
                    label: 'Bought',
                    data: database.filter((x, i) => i % granularity == 0).map((item) => {
                        return data['bought']['price']
                    }),
                    borderColor: '#c2c2c2',
                    //borderWidth: 1,
                    type: 'line',
                    lineTension: 0,
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                })
            }

            // Analytic Chart
            var labels = database.filter((x, i) => i % granularity == 0).map((item) => {
                var time = new Date(Number(item['time']));
                return time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            })

            var myChart = new Chart(gchart, {
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
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }, {
                            display: false,
                            id: 'B',
                            position: 'right',
                            gridLines: {
                                color: '#46496c',
                            },

                            ticks: {
                                //stepSize: 4500,
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false,
                                max: Number(await getMaxValue(database.map((item) => {
                                    return item['volume']
                                }))) * 2.5
                            }
                        }]
                    }
                }
            });

            /* Basic Chart */

            var gcandle = document.getElementById('GraphCandle').getContext('2d');

            var myChart = new Chart(gcandle, {
                data: {
                    labels: database.map((item) => {
                        var time = new Date(item['time']);
                        return time.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }),
                    datasets: [{
                        label: 'graph',
                        data: database.map((item) => {
                            return item['price']
                        }),
                        borderColor: '#314DED',
                        borderWidth: 1,
                        type: 'line',
                        lineTension: 0,
                        borderWidth: 2,
                        pointRadius: 0,
                    }],
                },
                options: {
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: '#46496c',
                            },

                            ticks: {
                                //autoSkip: true,
                                maxTicksLimit: 20,
                                fontColor: "#9097b9",
                                fontSize: 12,
                                //beginAtZero: true
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                color: '#46496c',
                            },

                            ticks: {
                                fontColor: "#9097b9",
                                fontSize: 12,
                                beginAtZero: false
                            }
                        }]
                    }
                }
            });

            //const tradingPair = data['tradingPair'].split('-')

            const base = tradingPair[0]
            const exchange = tradingPair[1]

            console.log(base, exchange)

            const baseBalance = data['balance']
            const exchangeBalance = data['native_balance']

            if (baseBalance > 0) {
                $('#balance').text(`${Number(baseBalance).toFixed(data['base_increment'])} ${base}`)
            } else $('#balance').text(`${Number(exchangeBalance).toFixed(data['quote_increment'])} ${exchange}`)
        }
    }
});


async function getMinValue(array) {
    var min = undefined
    for (var a in array) {
        if (!min) min = array[a]
        else if (array[a] < min) min = array[a]
    }
    return min
}

async function getMaxValue(array) {
    return new Promise((resolve, reject) => {
        var max = undefined
        for (var a in array) {
            if (!max) max = array[a]
            else if (array[a] > max) max = array[a]
        }
        resolve(max)
    })
}