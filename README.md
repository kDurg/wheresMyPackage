# wheresMyPackage
Package tracking application using Node
## Description:

Package Tracker is a Node.js application that interfaces with several tracking API's (such as USPS, UPS, FedEx and DHL) as well as a SQL database. 

## Purpose:

Over the holiday season, my wife and I ordered a lot of packages from different online vendors. I found myself constantly searching around for tracking numbers in my email to check the delivery status of the packages. I started to leave browsers open with the inputted tracking numbers for quick reference, but then forgot which tracking number belonged to each item. This is when I came up with the idea to make a lightweight package tracking application. I didn't need a robust front end UI and decided to use Node.js with [inquirer](https://www.npmjs.com/package/inquirer#examples) (for basic command-line navigation). 

## Challenges:

This project was pretty straight forward and there wasn't many challenges over all. The main hurdle was interfacing with the different shipping carrier's APIs since documentation left a lot to be desired. After starting to build out the requests for FedEx, I decided to opt into using another package, [shipIt](https://www.npmjs.com/package/shipit), to reduce the amount of setup involved to communicate with the shipping carrier API's. 

## Future Plans:

Even though Package Tracker was able to solve my basic needs for tracking packages and adding custom tags, there are a few things that I plan to add. Some of these ideas are:

- Add additional mail carriers such as [Amazon.com](http://amazon.com).
- Create an in-depth tracking option to show every update for given packages.
- Allow for multiple users and separate databases for saved packages.
- Add option for Recent search history.
- Move saved package databases to a hosted server.

## Sample Images:

- Main menu

    ![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8d7b9e9f-ad61-40b5-acbd-28b85eb5c60b/mainmenu.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8d7b9e9f-ad61-40b5-acbd-28b85eb5c60b/mainmenu.png)

- Search functionality

    ![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f1f586e9-70d1-4afb-8e56-dade2018db1d/search.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f1f586e9-70d1-4afb-8e56-dade2018db1d/search.png)

    ![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8bc36aa2-adf7-4850-931b-65ea4a8b9098/results.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8bc36aa2-adf7-4850-931b-65ea4a8b9098/results.png)

- Saved Packages

    ![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/aae9d729-9159-4afc-b865-fae8d376dc81/savedpackages.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/aae9d729-9159-4afc-b865-fae8d376dc81/savedpackages.png)