const mysql = require("mysql");
const inquirer = require("inquirer");
const {
    UpsClient,
    FedexClient,
    UspsClient,
    DhlClient,
    LasershipClient,
    OnTracClient,
    UpsMiClient,
    DhlGmClient,
    CanadaPostClient,
    AmazonClient,
    PrestigeClient
  } = require('shipit');

let isWindows = /^win/.test(process.platform); // use rawlist type for windows
let listType;
!isWindows ? listType = 'list' : listType = 'rawlist';

// DATABASE CONNECTION VARIABLES
const apiKeys = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "packagetrackerapikeys"
});
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "packagetracker"
});

let fedex, ups, dhl, usps;

// CHECK TO SEE IF WE HAVE ACCESS TO EACH CARRIERS API
apiConnection=()=>{
    let status = 0;

    apiKeys.connect(err => {
        if (err) throw err;
        apiKeys.query("SELECT * FROM carrierapikeys", (err, res) => {
            if (err) throw err;
            res.forEach(key => {
                switch(key.carrier){
                    case 'fedex':
                        fedex = new FedexClient ({
                            key: key.api_key,
                            password: key.password,
                            account: key.account_number,
                            meter: key.meter_number                        
                        });
                        fedex.requestData({trackingNumber: '74899989049138549412'}, (err, result) =>{
                            if (err) {
                                // console.log (`FedEx [ERROR] error retrieving tracking data ${err}`)
                                status = 0;
                            }
                            if (result) {
                                // console.log (`FedEx [DEBUG] new tracking data received ${JSON.stringify(result)}`)
                                status = 1;
                            }
                            updateAPIstatus(key.carrier, status);
                        });
                    break;

                    case 'ups':
                        ups = new UpsClient ({
                            licenseNumber: key.api_key,
                            userId: key.username,
                            password: key.password
                        });
                        ups.requestData({trackingNumber: '1Z999AA10123456784'}, (err, res) => {
                            if (err) {
                                // console.log (`UPS [ERROR] error retrieving tracking data ${err}`)
                                status = 0;
                            }
                            if (res) {
                                // console.log (`UPS [DEBUG] new tracking data received ${JSON.stringify(res)}`)
                                status = 1;
                            }
                            updateAPIstatus(key.carrier, status);
                        });
                    break;

                    // ********************* USE 'new DhlClient' FOR NON-EUROPEAN SHIPPING *********************
                    case 'dhl':
                        dhl = new DhlGmClient ({ 
                            userId: key.username,
                            password: key.password
                        });
                        dhl.requestData({trackingNumber: '8564385550'}, (err, res)=> {
                            if (err) {
                                // console.log (`DHL [ERROR] error retrieving tracking data ${JSON.stringify(err.error)}`)
                                status = 0;
                            }
                            if (res) {
                                // console.log (`DHL [DEBUG] new tracking data received ${JSON.stringify(res)}`)
                                status = 1;
                            }
                            updateAPIstatus(key.carrier, status);
                        });
                    break;

                    // ********************* NOT WORKING? UNDEFINED ANSWER *********************
                    case 'usps':
                        usps = new UspsClient ({
                            userId: key.username,
                            clientIp: key.api_key
                        });
                        usps.requestData({trackingNumber: '9361289693090475463084'}, (err, res)=> {
                            // console.log('usps: ' + res)
                            if (err) {
                                // console.log (`USPS [ERROR] error retrieving tracking data ${JSON.stringify(err)}`)
                                status = 0;
                            }
                            if (res) {
                                // console.log (`USPS [DEBUG] new tracking data received ${JSON.stringify(res)}`)
                                status = 1;
                            }
                            updateAPIstatus(key.carrier, status);
                        });
                    break;

                }
            });
        });
    });
}

exitApplication=()=>{
    console.log('\n \n \n... EXITING APPLICATION, THANK YOU!\n \n \n');
    connection.end();
}

findCarrier=(trackingNumber)=>{
    let tNum = JSON.stringify(trackingNumber.searchTrackingNumber.length);
    let trackingCarrier;

    // UPS
    if (tNum==18 && trackingNumber.searchTrackingNumber.match(
        /\b(1Z ?[0-9A-Z]{3} ?[0-9A-Z]{3} ?[0-9A-Z]{2} ?[0-9A-Z]{4} ?[0-9A-Z]{3} ?[0-9A-Z]|[\dT]\d\d\d ?\d\d\d\d ?\d\d\d)\b/)){
            trackingCarrier = 'ups'
    // FedEx
    } else if (
        tNum == 12 ||  tNum ==14 || tNum ==15 ||  tNum ==20 ||  tNum ==22
        && trackingNumber.searchTrackingNumber.match(
            /(\b96\d{20}\b)|(\b\d{15}\b)|(\b\d{12}\b)/ || 
            /\b((98\d\d\d\d\d?\d\d\d\d|98\d\d) ?\d\d\d\d ?\d\d\d\d( ?\d\d\d)?)\b/ ||
            /^[0-9]{15}$/)) {
                trackingCarrier = 'fedex'
    // USPS
    } else if (trackingNumber.searchTrackingNumber.match(
        /(\b\d{30}\b)|(\b91\d+\b)|(\b\d{20}\b)/ ||
        /^E\D{1}\d{9}\D{2}$|^9\d{15,21}$/ ||
        /^91[0-9]+$/ ||
        /^[A-Za-z]{2}[0-9]+US$/)){
            trackingCarrier = 'usps'
    // DHL
    } else if (
        tNum == 10 
        && trackingNumber.searchTrackingNumber.match(
            /^\d{10,11}$/)) {
                trackingCarrier = 'dhl'
    // NO MATCHES
    } else (trackingCarrier = 'none')

    return trackingCarrier;
}

getPackageData=(carrier, trackNum)=>{
    let data = [];

    switch(carrier){
        case 'dhl':
            //dhl
        break;

        case 'fedex':
            console.log(`Shipping package ${trackNum} with ${carrier}`)
        break;

        case 'ups': //1Z999AA10123456784
        console.log('UPS!!!')
            ups.requestData({trackingNumber: trackNum}, (err, result) =>{
                if (err) {
                    // console.log (`FedEx [ERROR] error retrieving tracking data ${err}`)
                }
                if (result) {
                    // console.log (`UPS [DEBUG] new tracking data received ${JSON.stringify(result)}`)
                    
                    eta = result.eta !== 'undefined' ? result.eta : 'No Data'
                    service = result.service !== 'undefined' ? result.service : 'No Data'
                    weight = result.weight !== 'undefined' ? result.weight : 'No Data'
                    status = result.status !== 'undefined' ? result.status : 'No Data'
                    timestamp = result.activities[0].timmestamp !== 'undefined' ? result.timmestamp : 'No Data'
                    location = result.activities[0].location !== 'undefined' ? result.location : 'No Data'
                    details = result.activities[0].details !== 'undefined' ? result.details : 'No Data'

                    data.push({
                        eta, service, weight, status, timestamp, location, details
                    })

                }
                console.log('data: ' + JSON.stringify(data))
            });
        break;

        case 'usps':
            //usps
        break;

        case 'none':
            // none
        break;
    }
    return data;
}

searchForPackage=()=>{
    console.log('\n \n \n ===========================================');
    console.log('| Search For A Package By Entering A Tracking Number\n');
    inquirer.prompt({
        name: 'searchTrackingNumber',
        type: 'input',
        message: 'Enter Tracking Number:', 
    }).then(answer => {
        let carrierName = findCarrier(answer);
        let trackingNumber = answer.searchTrackingNumber;

        // ONCE WE HAVE THE CARRIER, LETS MAKE A CALL TO API TO TRACK THE PACKAGE
        let returnedData = getPackageData(carrierName, trackingNumber);
        
        // setTimeout(()=> 
        //     console.log(`Service: ${returnedData[0].service}`),
        //     console.log(`Status: ${returnedData[0].status}`),
        //     console.log(`ETA: ${returnedData[0].eta}`),
        //     console.log(`Weight: ${returnedData[0].weight}`),
        //     console.log(`Last Update: ${returnedData[0].timestamp}`),
        //     console.log(`Last Location: ${returnedData[0].location}`),
        //     console.log(`Details: ${returnedData[0].details}`)
        //     ,500);
        // setTimeout(()=>
        //     inquirer.prompt({
        //         name: 'postSearchActions',
        //         type: listType,
        //         choices: [
        //             "Save Package",
        //             "Back"
        //         ]
        //     }).then(answer=> {
        //         switch (answer.postSearchActions){
        //             case "Save Package":
        //                 savePackage()
        //                 break;
                        
        //                 case "Back":
        //                     mainSelectionPage()
        //                     break;
        //                 }
        //             })
        // ,3000)
    });
}

mainSelectionPage=()=>{
    console.log('\n \n \n ===========================================');
    inquirer.prompt({
        name: "selectionScreen",
        type: listType,
        message: "\n \n Welcome to Package Tracker, What Would You Like To Do Today?",
        choices: [
            "Locate Package",
            "View Saved Packages",
            "Leave Package Tracker"
        ]
    }).then((answer) => {
        console.log(answer);
        switch (answer.selectionScreen) {
            case "Locate Package":
                searchForPackage();
                break;
            case "View Saved Packages":
                viewPackages();
                break;
            case "Leave Package Tracker":
                exitApplication();
                break;
        }
    });
}

// WORK ON THIS AFTER SETTING UP getPackageData
savePackage=(dataObject)=>{
    console.log('\n \n \n ===========================================');
    console.log(dataObject); // send object with data

}

// UPDATE THE STATUS OF API KEYS
updateAPIstatus=(carrier, status)=>{
    // console.log(`updated status: ${carrier} | ${status}`);
    let sqlQuery= `UPDATE carrierapikeys SET current_api_status = ${status} WHERE carrier = "${carrier}"`; // CLEAN UP WITH SQL PREPARED STATMENT TO PREVENT INJECTION
     
    apiKeys.query(sqlQuery, (err, res)=> {
        if (err) throw err;
    });

    // SANITY CHECK
    let checkDB = "SELECT * FROM carrierapikeys"
    apiKeys.query(checkDB, (err, res)=> {
        if (err) throw err;
        // console.log(res)
    });
}

viewPackages=()=>{
    connection.query("SELECT * FROM searchedpackages", (err, res) => {
        if (err) throw err;
        console.log('\n \n \nVIEWING SAVED PACKAGES \n \n');
        res.forEach(package => {
            // console.log(package);
            console.log('===========================================');
            package.custom_note !== '' ? console.log('| ' + package.custom_note + '\n|') : console.log('| PACKAGE ' + package.id + '\n|');
            console.log('| ' + package.carrier);
            console.log('| ' + package.tracking_number);
            console.log('===========================================');

        });
        console.log('\n \n');
        inquirer.prompt({
            name: 'selectionAfterSavedPackages',
            type: listType,
            message: "\n \n What Would You Like To Do?",
            choices: [
                "Delete Saved Package",
                "Back To Main Menu"
            ]
        }).then((answer) => {
            switch (answer.selectionAfterSavedPackages) {
                case  "Delete Saved Package":
                    console.log('DELETE PACKAGE OPTION!');
                    viewPackages();
                    break;

                case "Back To Main Menu":
                    console.log('Returning To Main Menu\n \n \n \n \n');
                    mainSelectionPage();
                    break;
            }
        });
    });     
}


// START THE CONNECTIONS
apiConnection()

connection.connect((err) => {
    if (err) throw err;
    mainSelectionPage();
});