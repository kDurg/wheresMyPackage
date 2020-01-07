const mysql = require("mysql");
const inquirer = require("inquirer");

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

apiKeys.connect(err => {
    if (err) throw err;
    apiKeys.query("SELECT * FROM carrierapikeys", (err, res) => {
        if (err) throw err;
        // console.log("\n=============================================================================\nAPI KEYS\n");
        // res.forEach(key => { console.log(key.friendly_name) });
        // console.log("=============================================================================\n \n \n");
    });
});

connection.connect((err) => {
    if (err) throw err;
    mainSelectionPage();
});

mainSelectionPage = () => {
    inquirer
        .prompt({
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
                    // searchForPackage();
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

exitApplication = () => {
    console.log('\n \n \n... EXITING APPLICATION, THANK YOU!\n \n \n');
    connection.end();
}

viewPackages = () => {
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
        inquirer
            .prompt({
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
            })

    });
        
}