const mysql = require("mysql");
const inquirer = require("inquirer");

const FEDEX = require('./carriers/fedex');
const USPS = require('./carriers/usps');
const UPS = require('./carriers/ups');
const DHL = require('./carriers/dhl');

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

let fedex;

// ALL OF OUR FUNCTIONS
apiConnection=()=>{
    apiKeys.connect(err => {1
        if (err) throw err;
        apiKeys.query("SELECT * FROM carrierapikeys", (err, res) => {
            if (err) throw err;
            // console.log("\n=============================================================================\nAvailable API KEYS\n");
            res.forEach(key => {
                switch(key.carrier){
                    case 'fedex':
                        fedex ={
                            environment: 'sandbox', // or live
                            debug: true,
                            key: key.api_key,
                            password: key.password,
                            account_number: key.account_number,
                            meter_number: key.meter_number,
                            imperial: true // set to false for metric
                        };
                        console.log('fedex credentials::::::::: '+ fedex.key)
                    break;
                }
            });
            // console.log("=============================================================================\n \n \n");
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

getPackageData=(carrier, trackingNumber)=>{
            
        switch(carrier){
            case 'dhl':
                //dhl
            break;

            case 'fedex':
                console.log(`Shipping package ${trackingNumber} with ${carrier}`)
            break;

            case 'ups':
                //ups
            break;

            case 'usps':
                //usps
            break;

            case 'none':
                // none
            break;
        }
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
        getPackageData(carrierName, trackingNumber)
        inquirer.prompt({
            name: 'postSearchActions',
            type: listType,
            choices: [
                "Save Package",
                "Back"
            ]
        }).then(answer=> {
            switch (answer.postSearchActions){
                case "Save Package":
                    savePackage()
                break;

                case "Back":
                    mainSelectionPage()
                break;
            }
        });
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
// apiConnection()1

connection.connect((err) => {
    if (err) throw err;
    mainSelectionPage();
});