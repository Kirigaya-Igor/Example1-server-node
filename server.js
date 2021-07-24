const fs = require('fs');
const crypto = require('crypto');

const origin = {
    transport: ['websocket', 'polling'],
    cors: true,
    origins: 'localhost:*'
};

const io = require('socket.io')(20100, origin);

const myFile = fs.readFileSync('myFile.json');
const testFile = JSON.parse(myFile);

io.on('connection', client => {

    client.on("newSendOperation", (data) => {
        const newData = JSON.parse(data);
        const secretKey = 'my 1 key';
        const hash = crypto.createHash('sha256', secretKey).update(newData.nameApp).digest('hex');

        const serverTime = Date.now()
        const timeDifference = serverTime - newData.timestamp
        console.log('timeDifference = ' + timeDifference + ' Millisecond');

        const response = {
            appName: hash,
            logoUrl: testFile.logoUrl,
            timeDifference: timeDifference
        }

        if(testFile.id === newData.id) {
            io.emit("sendOperation", JSON.stringify(response));
        }
    })

    client.on("formDataSend", (data) => {
        const newData = JSON.parse(data);
        console.log(`
Hash: ${newData.appHashName};
App id: ${newData.appId};
Adjusted time: ${newData.clientTime};
Data from a text input: ${newData.formData[0].data};
Data from a select input: ${newData.formData[1].data};`
        );
    })
});

io.listen(20200);