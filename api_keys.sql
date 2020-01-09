DROP DATABASE IF EXISTS packagetrackerapikeys;
CREATE DATABASE packagetrackerapikeys;

USE packagetrackerapikeys;

CREATE TABLE carrierapikeys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrier VARCHAR(255) NOT NULL,
    friendly_name VARCHAR(255) NOT NULL,
    apikey VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    meter_number VARCHAR(255) NOT NULL
);

INSERT INTO carrierapikeys (carrier, friendly_name, apikey, password, account_number, meter_number)
    VALUES
        ('ups', 'UPS', 'DD74C97FB4075D72', 'Kenneth_45', '123456789', '987654321'),
        ('fedex', 'FedEx', 'asdfasdfasdf', 'Kenneth_45', '123456789', '987654321')
    ;

SELECT * FROM carrierapikeys;