DROP DATABASE IF EXISTS packagetracker;
CREATE DATABASE packagetracker;

USE packagetracker;

-- NEED ID, TRACKING NUMBER, CARRIER, CUSTOM NOTE
-- SHIP DATE, SHIP LOCATION
-- LAST UPDATE DATE, LAST UPDATE LOCATION
-- STATUS: WAITING FOR SHIPMENT, IN TRANSIT, DELIVERED 
-- ON TRACK? 
-- AUTO DELETE AFTER 7 DAYS?

CREATE TABLE searchedpackages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(255) NOT NULL,
    carrier VARCHAR(255) NOT NULL,
    custom_note VARCHAR(255),
    last_location VARCHAR(255),
    last_update VARCHAR(255)
);

INSERT INTO searchedpackages (tracking_number, carrier, custom_note, last_location, last_update)
    VALUES 
        ('74899989049138549412','fedex','','',''),
        ('9361289693090475463084','usps','','','')
    ;
    
SELECT * FROM searchedpackages;