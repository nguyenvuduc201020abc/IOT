//MQTT
var mqtt = require('mqtt')
//mongoDB
const { MongoClient } = require('mongodb');
//aqi
const aqiCalculator = require("aqi-calculator");
//express
const express = require('express')
const app = express()
//moment
var moment = require('moment');


// const host = 'broker.hivemq.com'
// const port = '1883'
// const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
// const connectUrl = `mqtt://${host}:${port}`

// const client = mqtt.connect(connectUrl, {
//     clientId,
//     clean: true,
//     connectTimeout: 4000,
//     username: 'ducnv',
//     password: 'vuduc2010',
//     reconnectPeriod: 1000,
// })

// var topic = "/topic/qos1"


// // const uri = "mongodb+srv://iothust:iothust@iothust.ty0uf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = "mongodb://localhost:27017";
const mongc = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// client.on('message', (topic, message) => {
//     message = message.toString()
//     jsonData = JSON.parse(message)
//     console.log()

//     const AQI = aqiCalculator({
//         datetime: jsonData.data.time,
//         pm25: jsonData.data.pm2_5,
//         pm10: jsonData.data.pm10,
//         so2: jsonData.data.so2,
//         no: null,
//         nox: null,
//         no2: jsonData.data.no2,
//         o3: null,
//         co: jsonData.data.co,

//     });

//     console.log(AQI);

//     mongc.connect((error, client) => {
//         var mCol = client.db('mqttIOT').collection('sensor')
//         obj_msg = JSON.parse(message)
//         mCol.insertOne({
//             deviceId: jsonData.deviceId,
//             deviceType: jsonData.deviceType,
//             data: {
//                 temperature: jsonData.data.temperature,
//                 humidity: jsonData.data.humidity,
//                 location: { latitude: jsonData.data.location.latitude, longitude: jsonData.data.location.longitude },
//                 time: jsonData.data.time,
//                 // co: jsonData.data.co,
//                 // no2: jsonData.data.no2,
//                 // so2: jsonData.data.so2,
//                 // pm2_5: jsonData.data.pm2_5,
//                 // pm10: jsonData.data.pm10
//                 co: jsonData.data.co,
//                 co2: jsonData.data.co2,
//                 pm2_5: jsonData.data.pm2_5,
//                 pm10: jsonData.data.pm10
//             }
//         }, () => {
//             console.log("ok")
//             client.close()
//         })
//     })
// })

// client.on('connect', () => {
//     client.subscribe(topic)
// })



const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => res.send('IOT HUST'));

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at localhost:${PORT}`);
});

app.get('/getInformation', (req, res) => {

    const jsonBody = req.body;
    console.log('jsonBody: ', jsonBody);

    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
            if (err) throw err;
            let jsonRes = []
            result.forEach(snap => {
               
                jsonRes.push({
                    data: {
                        humidity: snap.data.humidity,
                        temperature: snap.data.temperature,
                        location: snap.data.location,
                        time: snap.data.time,
                        aqi: null,
                        polutants: {
                            // co: snap.data.co,
                            // no2: snap.data.no2,
                            // so2: snap.data.so2,
                            // pm2_5: snap.data.pm2_5,
                            // pm10: snap.data.pm10
                            co: snap.data.co,
                            co2: snap.data.co2,
                            pm2_5: snap.data.pm2_5,
                            pm10: snap.data.pm10
                        }
                    }
                })
            })
            res.json(jsonRes)
            client.close();
        });
    });
});


// get data is same of day
app.get('/getInformation_by_date', (req, res) => {

    const jsonBody = req.body;

 

    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
          
            if (err) throw err;
            let jsonRes = []
            const datetime = moment(jsonBody.dateTime, "YYYY-MM-DDTHH:mm:ss")
            result.forEach(snap => {
                const snapDatetime = moment(snap.data.time, "YYYY-MM-DDTHH:mm:ss")
                if (snapDatetime.day() === datetime.day()) {
                    jsonRes.push({
                        data: {
                            humidity: snap.data.humidity,
                            temperature: snap.data.temperature,
                            location: snap.data.location,
                            time: snap.data.time,
                            aqi: null,
                            polutants: {
                                // co: snap.data.co,
                                // no2: snap.data.no2,
                                // so2: snap.data.so2,
                                // pm2_5: snap.data.pm2_5,
                                // pm10: snap.data.pm10
                                co: snap.data.co,
                                co2: snap.data.co2,
                                pm2_5: snap.data.pm2_5,
                                pm10: snap.data.pm10
                            }
                        }
                    })
                }
            })
            res.json(jsonRes)
            client.close();
        });
    });
});

// get data is same hour
app.get('/getInformation_by_hour', (req, res) => {

    const jsonBody = req.body;

   

    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
            if (err) throw err;
            let count = 0
            let humidity = 0
            let temperature = 0
            let aqi = 0
            let co = 0
            let co2 = 0
            let so2 = 0
            let pm2_5 = 0
            let pm10 = 0
            let location = ""
            let time = ""

            const datetime = moment(jsonBody.dateTime, "YYYY-MM-DDTHH:mm:ss")
            result.forEach(snap => {
                const snapDatetime = moment(snap.data.time, "YYYY-MM-DDTHH:mm:ss")
                if (snapDatetime.hour() === datetime.hour()) {
                    humidity += snap.data.humidity
                    temperature += snap.data.temperature
                    location = snap.data.location
                    time = snap.data.time
                    aqi = null
                    co += snap.data.co
                    co2 += snap.data.co2
                    // so2 += snap.data.so2
                    pm2_5 += snap.data.pm2_5
                    pm10 += snap.data.pm10
                    count++
                }
            })
            res.json({
                data: {
                    humidity: humidity / count,
                    temperature: temperature / count,
                    location: location,
                    time: time,
                    aqi: aqi,
                    polutants: {
                        co: co / count,
                        co2: co2 / count,
                        // so2: so2 / count,
                        pm2_5: pm2_5 / count,
                        pm10: pm10 / count
                    }
                }
            })
            client.close();
        });
    });
});


// get average data by every hour
app.get('/getInformationbydate2', (req, res) => {

    const jsonBody = req.body;

  

    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
            if (err) throw err;
            let count = 0
            let humidity = 0
            let temperature = 0
            let aqi = 0
            let co = 0
            let no2 = 0
            let so2 = 0
            let pm2_5 = 0
            let pm10 = 0
            let location = ""
            let time = ""

            const datetime = moment(jsonBody.dateTime, "YYYY-MM-DDTHH:mm:ss")
            result.forEach(snap => {
                const snapDatetime = moment(snap.data.time, "YYYY-MM-DDTHH:mm:ss")
                if (snapDatetime.day() === datetime.day()) {
                    if(snapDatetime.hour() === datetime.hour())
                    {
                    humidity += snap.data.humidity
                    temperature += snap.data.temperature
                    location = snap.data.location
                    time = snap.data.time
                    aqi = null
                    co += snap.data.co
                    no2 += snap.data.no2
                    so2 += snap.data.so2
                    pm2_5 += snap.data.pm2_5
                    pm10 += snap.data.pm10
                    count++
                }}
            })
            res.json({
                data: {
                    humidity: humidity / count,
                    temperature: temperature / count,
                    location: location,
                    time: time,
                    aqi: aqi,
                    polutants: {
                        co: co / count,
                        no2: no2 / count,
                        so2: so2 / count,
                        pm2_5: pm2_5 / count,
                        pm10: pm10 / count
                    }
                }
            })
            client.close();
        });
    });
});

app.get('/getInformationbydate3', (req, res) => {

    const jsonBody = req.body;

  

    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
            if (err) throw err;
            

            const datetime = moment(jsonBody.dateTime, "YYYY-MM-DDTHH:mm:ss")
            let ans = [];
            for(let i = 0; i < 23; i++) {
                let count = 0
                let humidity = 0
                let temperature = 0
                let aqi = 0
                let co = 0
                let no2 = 0
                let so2 = 0
                let pm2_5 = 0
                let pm10 = 0
                let location = ""
                let time = ""
                
                result.forEach(snap => {
                    const snapDatetime = moment(snap.data.time, "YYYY-MM-DDTHH:mm:ss")
                    if (snapDatetime.day() === datetime.day()) {
                        
                        if(snapDatetime.hour() === i) {
                            humidity += snap.data.humidity
                            temperature += snap.data.temperature
                            location = snap.data.location
                            time = snap.data.time
                            aqi = null
                            co += snap.data.co
                            no2 += snap.data.no2
                            so2 += snap.data.so2
                            pm2_5 += snap.data.pm2_5
                            pm10 += snap.data.pm10
                            count++
                        }
                    }
                })
                ans.push(
                    {
                        humidity: humidity / count,
                        temperature: temperature / count,
                        location: location,
                        time: time,
                        aqi: aqi,
                        polutants: {
                            co: co / count,
                            no2: no2 / count,
                            so2: so2 / count,
                            pm2_5: pm2_5 / count,
                            pm10: pm10 / count
                        }
                    }
                )
            }
            res.json({
                data: ans
            })
            client.close();
        });
    });
});


app.get('/getinformationtimeto', (req, res) => {

    const jsonBody = req.body;

 

    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
            if (err) throw err;
            let jsonRes = []
            const datetimeF = moment(jsonBody.from, "YYYY-MM-DDTHH:mm:ss")
            const datetimeT = moment(jsonBody.to, "YYYY-MM-DDTHH:mm:ss")
            result.forEach(snap => {
                const snapDatetime = moment(snap.data.time, "YYYY-MM-DDTHH:mm:ss");
                if (snapDatetime.isBetween(datetimeF, datetimeT)) {
                    jsonRes.push({
                        data: {
                            humidity: snap.data.humidity,
                            temperature: snap.data.temperature,
                            location: snap.data.location,
                            time: snap.data.time,
                            aqi: null,
                            polutants: {
                                // co: snap.data.co,
                                // no2: snap.data.no2,
                                // so2: snap.data.so2,
                                // pm2_5: snap.data.pm2_5,
                                // pm10: snap.data.pm10
                                // co: snap.data.co,
                                // co2: snap.data.co2,
                                // pm2_5: snap.data.pm2_5,
                                // pm10: snap.data.pm10
                            }
                        }
                    })
                }
            })
            res.json(jsonRes)
            client.close();
        });
    });
});

app.get('/getInformationbytype', (req, res) => {

    const jsonBody = req.body;

   
    const type = jsonBody.type
    mongc.connect((error, client) => {
        var mCol = client.db('mqttIOT').collection('sensor')
        mCol.find({ deviceId: jsonBody.deviceId }).toArray(function (err, result) {
            if (err) throw err;
            let jsonRes = []
            const datetime = moment(jsonBody.dateTime, "YYYY-MM-DDTHH:mm:ss")
            result.forEach(snap => {
                const snapDatetime = moment(snap.data.time, "YYYY-MM-DDTHH:mm:ss");
                if (snapDatetime.day() === datetime.day()) {
                    if (type == "humidity") {
                        jsonRes.push(
                            {
                                humidity: snap.data.humidity
                            }
                        )
                    }
                    if (type == "temperature") {
                        jsonRes.push(
                            {
                                temperature: snap.data.temperature,
                            }
                        )
                    }
                    if (type == "co") {
                        jsonRes.push(
                            {
                                co: snap.data.co,
                            }
                        )
                    }
                    if (type == "co2") {
                        jsonRes.push(
                            {
                                no2: snap.data.co2,
                            }
                        )
                    }
                    // if (type == "so2") {
                    //     jsonRes.push(
                    //         {
                    //             so2: snap.data.so2,
                    //         }
                    //     )
                    // }
                    if (type == "pm2_5") {
                        jsonRes.push(
                            {
                                pm2_5: snap.data.pm2_5,
                            }
                        )
                    }
                    if (type == "pm10") {
                        jsonRes.push(
                            {
                                pm10: snap.data.pm10,
                            }
                        )
                    }
                    if (type == "aqi") {
                        jsonRes.push(
                            {
                                aqi: snap.data.aqi,
                            }
                        )
                    }
                }
            })
            res.json(jsonRes)
            client.close();
        });
    });
});