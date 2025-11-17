CREATE DATABASE irms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE usertbl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'receptionist', 'owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `usertbl` (`username`, `email`, `phone`, `password`, `role`, `created_at`) VALUES ('receptionist', 'receptionist@mail.com', NULL, '$2a$12$KSbauU6r3jbjf61r/ghyHefQ5zQ/neHEcJk75tDe6eGjARjm5QfE2', 'receptionist', NOW()), ('owner', 'owner@mail.com', NULL, '$2a$12$KSbauU6r3jbjf61r/ghyHefQ5zQ/neHEcJk75tDe6eGjARjm5QfE2', 'owner', NOW());

CREATE TABLE amenitiestbl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    capacity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available ENUM('Yes', 'No') DEFAULT 'Yes'
);

INSERT INTO amenitiestbl (image, name, type, description, capacity, price, available) VALUES
('kubo_small_1.jpg',   'Small Kubo 1',  'kubo',          'Small open hut for guests',     5,   500,  'Yes'),
('kubo_small_2.jpg',   'Small Kubo 2',  'kubo',          'Small open hut for guests',     5,   500,  'Yes'),
('kubo_large_1.jpg',   'Large Kubo 1',  'kubo',          'Large hut for families',        5,   800,  'Yes'),
('kubo_large_2.jpg',   'Large Kubo 2',  'kubo',          'Large hut for families',        5,   800,  'Yes'),
('cabin_1.jpg',        'Cabin 1',       'cabin',         'Enclosed cabin for big groups', 15, 2500,  'Yes'),
('cabin_2.jpg',        'Cabin 2',       'cabin',         'Enclosed cabin for big groups', 15, 2500,  'Yes'),
('table_1.jpg',        'Table 1',       'table',         'Picnic table for small groups', 4,   200,  'Yes'),
('table_2.jpg',        'Table 2',       'table',         'Picnic table for small groups', 4,   200,  'Yes');