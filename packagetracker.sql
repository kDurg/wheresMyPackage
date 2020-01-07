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
    ship_date VARCHAR(255),
    ship_location VARCHAR(255),
    last_update_date VARCHAR(255),
    last_update_location VARCHAR(255),
    current_status INT,
    on_track_status INT
);

INSERT INTO searchedpackages (tracking_number, carrier, custom_note, ship_date, ship_location, last_update_date, last_update_location, current_status, on_track_status)
    VALUES 
        ('74899989049138549412', 'fedex', '', '', '', '', '', 0, 0)
    ;
    
SELECT * FROM searchedpackages;