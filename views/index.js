const urlParams = new URLSearchParams(window.location.search);
let machineID = urlParams.get('machine');

window.addEventListener('load', () => {
    if (!machineID) {
        alert('Invalid URL! Please use your personal Dashboard URL')
        return
    }
    let startTime = new Date()
    socket = io('ws://boehler-trading.com:8080');

    //console.log('socket id', socket.id)
    machineID = Buffer.from(machineID, 'base64').toString()

    $('#machineID').text(machineID)

    socket.on('connected', async (data) => {
        console.log('connected to socket')
        socket.emit('retrieveData', machineID)
    });

    let retried = false

    socket.on('machineData', async (data) => {
        if (data['status'] && data['status'] === 'offline') {
            if (!retried) {
                setTimeout(() => {
                    retried = true
                    socket.emit('retrieveData', machineID)
                }, 1000 * 10);
                return
            }
            retried = false
            $('#status').text('OFFLINE')
            alert('The requested bot is offline! Please check if the programm is running.')
            setTimeout(() => {
                socket.emit('retrieveData', machineID)
            }, 1000 * 30);
        } else {
            console.log('machine Data', data)
            $('#roi').text(Number(data['roi']).toFixed(2) + ' USDT')
            $('#ratio').text(Number(data['ratio']).toFixed(2))
            $('#profit').text(Number(data['profit']).toFixed(2) + '%')
            if (data['profit'] > 0) {
                $('#profit').addClass('plus')
                $('#profit').removeClass('minus')
            }
            else {
                $('#profit').addClass('minus')
                $('#profit').removeClass('plus')
            }
            $('#status').text('ONLINE')
            $('#trx').text(data['transactions'])

            $('#leverage').val(data['leverage'])
            $('#amount').val(data['amount'])
            $('#webhook').val(data['webhook'])
        }
    })

    socket.on('savedSettings', async (data) => {
        if (data === machineID) socket.emit('retrieveData', machineID)
    })

    socket.io.on("error", (error) => {
        // ...
        console.log(error)
    });

    socket.io.on("reconnect_failed", () => {
        // ...
    });

    window.save = save

    async function save() {
        let leverage = +$('#leverage').val()
        let amount = +$('#amount').val()
        let webhook = $('#webhook').val()

        socket.emit('setSettings', {
            machine: machineID,
            leverage,
            amount,
            webhook
        })
    }
});