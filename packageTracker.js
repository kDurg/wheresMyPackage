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
apiConnection = () => {
    let status = 0;

    apiKeys.connect(err => {
        if (err) throw err;
        apiKeys.query("SELECT * FROM carrierapikeys", (err, res) => {
            if (err) throw err;
            res.forEach(key => {
                switch (key.carrier) {
                    case 'fedex':
                        fedex = new FedexClient({
                            key: key.api_key,
                            password: key.password,
                            account: key.account_number,
                            meter: key.meter_number
                        });
                        fedex.requestData({ trackingNumber: '74899989049138549412' }, (err, result) => {
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
                        ups = new UpsClient({
                            licenseNumber: key.api_key,
                            userId: key.username,
                            password: key.password
                        });
                        ups.requestData({ trackingNumber: '1Z999AA10123456784' }, (err, res) => {
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
                        dhl = new DhlGmClient({
                            userId: key.username,
                            password: key.password
                        });
                        dhl.requestData({ trackingNumber: '8564385550' }, (err, res) => {
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

                    // ********************* DEPRECATION WARNING FROM MOMENTJS IN SHPIT CODE ->node_modules/moment/moment.js:289 to false
                    case 'usps':
                        usps = new UspsClient({
                            userId: key.username,
                            clientIp: key.password
                        });
                        usps.requestData({trackingNumber: '9361289693090475463084'}, (err, res)=> {
                            if (err) {
                                console.log (`USPS [ERROR] error retrieving tracking data ${JSON.stringify(err)}`)
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

exitApplication = () => {
    console.log('\n \n \n... EXITING APPLICATION, THANK YOU!\n \n \n');
    connection.end();
}

findCarrier = (trackingNumber) => {
    let tNum = JSON.stringify(trackingNumber.searchTrackingNumber.length);
    let trackingCarrier;

    // UPS
    if (tNum == 18 && trackingNumber.searchTrackingNumber.match(
        /\b(1Z ?[0-9A-Z]{3} ?[0-9A-Z]{3} ?[0-9A-Z]{2} ?[0-9A-Z]{4} ?[0-9A-Z]{3} ?[0-9A-Z]|[\dT]\d\d\d ?\d\d\d\d ?\d\d\d)\b/)) {
        trackingCarrier = 'ups'
        // FedEx
    } else if (
        tNum == 12 || tNum == 14 || tNum == 15 || tNum == 20 || tNum == 22
        && trackingNumber.searchTrackingNumber.match(
            /(\b96\d{20}\b)|(\b\d{15}\b)|(\b\d{12}\b)/ ||
            /\b((98\d\d\d\d\d?\d\d\d\d|98\d\d) ?\d\d\d\d ?\d\d\d\d( ?\d\d\d)?)\b/ ||
            /^[0-9]{15}$/)) {
        trackingCarrier = 'fedex'
        // USPS
    } else if (trackingNumber.searchTrackingNumber.match(
        /((\d{4})(\s?\d{4}){4}\s?\d{2})|((\d{2})(\s?\d{3}){2}\s?\d{2})|((\D{2})(\s?\d{3}){3}\s?\D{2})/)) {
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

getPackageData = (carrier, trackNum) => {
    let data = [];
    // console.log('GET DATA' + carrier)

    switch (carrier) {
        case 'dhl':
            //dhl
            break;

        case 'fedex':
            console.log(`Shipping package ${trackNum} with ${carrier}`)
            break;

        case 'ups': //1Z999AA10123456784
            console.log('UPS!!!')
            ups.requestData({ trackingNumber: trackNum }, (err, result) => {

                if (err) {console.log (`UPS [ERROR] error retrieving tracking data ${err}`)}
                if (result) {
                    // console.log (`UPS [DEBUG] new tracking data received ${JSON.stringify(result)}`)
                    let eta = result.eta !== 'undefined' ? result.eta : 'No Data'
                    let service = result.service !== 'undefined' ? result.service : 'No Data'
                    let weight = result.weight !== 'undefined' ? result.weight : 'No Data'
                    let status = result.status !== 'undefined' ? result.status : 'No Data'
                    let timestamp = result.activities[0].timmestamp !== 'undefined' ? result.timmestamp : 'No Data'
                    let location = result.activities[0].location !== 'undefined' ? result.location : 'No Data'
                    let details = result.activities[0].details !== 'undefined' ? result.details : 'No Data'

                    data.push({ eta, service, weight, status, timestamp, location, details });
                }
                // console.log('data: ' + JSON.stringify(data))
            });
            break;

        case 'usps':
            //usps 9361289693090475463084
            usps.requestData({ trackingNumber: trackNum }, (err, result) => {

                if (err) {console.log (`USPS [ERROR] error retrieving tracking data ${err}`)}
                if (result) { // ********************* NEED TO TRANSLATE STATUS
                    let friendlyName = 'US Postal Service';
                    let service = result.service;
                    let status = result.status;
                    let timestamp = result.activities[0].timestamp;
                    let location = result.activities[0].location;
                    let details = result.activities[0].details;

                    data.push({ carrier, trackNum, friendlyName, service, status, timestamp, location, details });

                    console.log('\n \n \n******************************');
                    console.log(`| Service: ${friendlyName} ${data[0].service}`);
                    console.log(`| Status: ${data[0].status}`);
                    console.log(`| Last Update: ${data[0].timestamp}`);
                    console.log(`| Last Location: ${data[0].location}`);
                    console.log(`| Details: ${data[0].details}`);
                    console.log('******************************');

                    inquirer.prompt({
                        name: 'afterSearch',
                        type: listType,
                        message: "What Would You Like To Do?",
                        choices: [
                            "Save Package",
                            "Back"
                        ]
                    }).then(answer => {
                        switch (answer.afterSearch) {
                            case "Save Package":
                                savePackage(data);
                            break;
                            
                            case "Back":
                                mainSelectionPage();
                            break;
                        }
                    });
                }
            });
            break;

        case 'none':
            console.log('\n \n \n \n \n \n ==========================================================================');
            console.log('| !!!  CARRIER ASSOCIATED WITH TRACKING NUMBER NOT FOUND, TRY AGAIN !!!')
            console.log(' ==========================================================================');
            setTimeout(()=> mainSelectionPage(), 3000);
        break;
    }
    return data;
}

savePackage = (packageData) => {
    let customName = '';
    console.log('\n \n \n ===========================================');
    inquirer.prompt({
        name: 'savePrompt',
        type: listType,
        message: `Would You Like To Add A Custom Name To Your ${packageData[0].friendlyName} Package?`,
        choices: [
            'Yes',
            'No',
            'Discard Package'
        ]
    }).then(answer =>{
        switch(answer.savePrompt){
            case 'Yes':
                inquirer.prompt({
                    name: 'saveCustomName',
                    type: 'input',
                    message: `Enter A Custom Name For Your ${packageData[0].friendlyName} Package`
                }).then(answer=>{
                    customName = answer.saveCustomName;                    
                    let sqlQuery = `INSERT INTO searchedpackages(tracking_number, carrier, custom_note) VALUES ('${packageData[0].trackNum}','${packageData[0].carrier}','${customName}')`;
                    connection.query(sqlQuery, (err, res) => {
                        if (err) {
                            console.log(`[Error] There Was An Error Saving ${err}`);
                            mainSelectionPage();
                        }
                        if (res) { 
                            console.log('.');
                            console.log('...');
                            console.log('.....');
                            console.log(`... Saved ${customName}...`);
                            console.log('.....');
                            console.log('...');
                            console.log('.');
                            mainSelectionPage();                    
                        }
                    });

                });
            break;

            case 'No':                
                let sqlQuery = `INSERT INTO searchedpackages(tracking_number, carrier, custom_note) VALUES ('${packageData[0].trackNum}','${packageData[0].carrier}','')`;
                connection.query(sqlQuery, (err, res) => {
                    if (err) {
                        console.log(`[Error] There Was An Error Saving ${err}`);
                        mainSelectionPage();
                    }
                    if (res) { 
                        console.log('.');
                        console.log('...');
                        console.log('.....');
                        console.log(`... Successfully Saved Your ${packageData[0].friendlyName} Package...`),
                        console.log('.....');
                        console.log('...');
                        console.log('.');
                        mainSelectionPage();                    
                    }
                });
            break;

            case 'Discard':
                mainSelectionPage();
            break;

        }
    })
}

searchForPackage = () => {
    console.log('\n \n \n ===========================================');
    console.log('| Search For A Package By Entering A Tracking Number\n');
    inquirer.prompt({
        name: 'searchTrackingNumber',
        type: 'input',
        message: 'Enter Tracking Number:',
    }).then(answer => {
        let carrierName = findCarrier(answer);
        let trackingNumber = answer.searchTrackingNumber;
        getPackageData(carrierName, trackingNumber);
    })
}

mainSelectionPage = () => {
    console.log('\n \n \n \n \n===========================================');
    inquirer.prompt({
        name: "selectionScreen",
        type: listType,
        message: "Welcome to Package Tracker, What Would You Like To Do Today?",
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
                viewPackages('view');
                break;
            case "Leave Package Tracker":
                exitApplication();
                break;
        }
    });
}

// UPDATE THE STATUS OF API KEYS
updateAPIstatus = (carrier, status) => {
    // console.log(`updated status: ${carrier} | ${status}`);
    let sqlQuery = `UPDATE carrierapikeys SET current_api_status = ${status} WHERE carrier = "${carrier}"`; // CLEAN UP WITH SQL PREPARED STATMENT TO PREVENT INJECTION

    apiKeys.query(sqlQuery, (err, res) => {
        if (err) throw err;
    });

    // SANITY CHECK
    // let checkDB = "SELECT * FROM carrierapikeys"
    // apiKeys.query(checkDB, (err, res) => {
    //     if (err) throw err;
        // console.log(res)
    // });
}

viewPackages = (actions) => {
    connection.query("SELECT * FROM searchedpackages", (err, res) => {
        if (err) throw err;
        console.log(`\n \n \nVIEWING SAVED PACKAGES`);
        let friendlyName, packageCount=0;
        res.forEach(package => {
            
            switch(package.carrier){
                case 'dhl': 
                    friendlyName = 'DHL';
                break;

                case 'fedex': 
                    friendlyName = 'FedEx';
                break;

                case 'ups':
                    friendlyName = "UPS";
                break;

                case 'usps':
                    friendlyName = "US Postal Service"
                break;
            }

            console.log('===========================================');
            console.log('| PACKAGE ' + package.id);
            package.custom_note !== '' ? console.log('| Custom Name: ' + package.custom_note) : null;
            console.log('| ');
            console.log('| Carrier: ' + friendlyName);
            console.log('| Tracking Number: ' + package.tracking_number);

            // GET UPDATES FOR THESE
            package.last_location !== '' ? console.log('| Last Location: ' + package.last_location): null;
            package.last_update !== '' ? console.log('| Last Update: ' + package.last_update) : null;
            console.log('===========================================');
            packageCount ++;
        });

        switch(actions){
            case 'view':
                inquirer.prompt({
                    name: 'selectionAfterSavedPackages',
                    type: listType,
                    message: "What Would You Like To Do?",
                    choices: [
                        "Delete Saved Package",
                        "Back To Main Menu"
                    ]
                }).then((answer) => {
                    switch (answer.selectionAfterSavedPackages) {
                        case "Delete Saved Package":
                            console.log('DELETE PACKAGE OPTION!');
                            viewPackages('delete');
                        break;
        
                        case "Back To Main Menu":
                            console.log('Returning To Main Menu');
                            mainSelectionPage();
                        break;
                    }
                });
            break;

            case 'delete':
                // WHICH PACKAGE TO DELETE?
                console.log(`Total Packages Saved: ${packageCount}`)
                inquirer.prompt({
                    name: 'deleteWhichPackage',
                    type: 'input',
                    message: "Which Package Number Would You Like To Delete?"
                }).then(answer=>{
                    // MAKE SURE THEY PICK A VALID PACKAGE
                    if (0 < answer.deleteWhichPackage && answer.deleteWhichPackage <= packageCount){
                        inquirer.prompt({
                            name: 'deleteVerify',
                            type: listType,
                            message: `Are You Sure You Want To Delete Package ${answer.deleteWhichPackage}?`,
                            choices: ['Yes', 'No']
                        }).then(answer=>{
                            // VERIFY CORRECT
                            switch(answer.deleteVerify){
                                case 'Yes':
                                    // UPDATE DB
                                    let sqlQuery = `DELETE FROM searchedpackages WHERE id = '${answer.deleteWhichPackage}';`;
                                    connection.query(sqlQuery, (err, res) => {
                                        if (err) {
                                            console.log(`[Error] There Was An Error Deleting Package ${answer.deleteWhichPackage} - ${err}`);
                                            mainSelectionPage();
                                        }
                                        if (res) { 
                                            console.log(JSON.stringify(res))
                                            viewPackages('view');
                                        }
                                    });
                                break;

                                case 'No':
                                    viewPackages('delete');
                                break;
                            }
                        })

                    } else { console.log('NOT VALID')}
                })
            break;
        }

        
    });
}


// START THE CONNECTIONS
apiConnection()

connection.connect((err) => {
    if (err) throw err;
    mainSelectionPage();
});