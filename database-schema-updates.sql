-- SQL to add coordinates to your cities table
-- Run this in your SQLite database

ALTER TABLE cities ADD COLUMN latitude REAL;
ALTER TABLE cities ADD COLUMN longitude REAL;

-- Sample coordinate data for European cities
UPDATE cities SET latitude = 48.8566, longitude = 2.3522 WHERE name = 'Paris';
UPDATE cities SET latitude = 51.5074, longitude = -0.1278 WHERE name = 'London';
UPDATE cities SET latitude = 52.5200, longitude = 13.4050 WHERE name = 'Berlin';
UPDATE cities SET latitude = 41.9028, longitude = 12.4964 WHERE name = 'Rome';
UPDATE cities SET latitude = 40.4168, longitude = -3.7038 WHERE name = 'Madrid';
UPDATE cities SET latitude = 52.3676, longitude = 4.9041 WHERE name = 'Amsterdam';
UPDATE cities SET latitude = 50.8503, longitude = 4.3517 WHERE name = 'Brussels';
UPDATE cities SET latitude = 47.3769, longitude = 8.5417 WHERE name = 'Zurich';
UPDATE cities SET latitude = 48.2082, longitude = 16.3738 WHERE name = 'Vienna';
UPDATE cities SET latitude = 55.6761, longitude = 12.5683 WHERE name = 'Copenhagen';

-- Create city_distances table for caching calculated distances
CREATE TABLE IF NOT EXISTS city_distances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_city_id INTEGER NOT NULL,
    to_city_id INTEGER NOT NULL,
    distance REAL NOT NULL,
    FOREIGN KEY (from_city_id) REFERENCES cities(id),
    FOREIGN KEY (to_city_id) REFERENCES cities(id),
    UNIQUE(from_city_id, to_city_id)
);