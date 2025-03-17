const sqlite3 = require('sqlite3').verbose(); // Importerer SQLite3-biblioteket og aktiverer verbose-modus for detaljert logging

const db = new sqlite3.Database('database.db'); // Oppretter en tilkobling til SQLite-databasen 'database.db'; filen opprettes hvis den ikke eksisterer

db.serialize(() => { // Kjører flere databaseoperasjoner sekvensielt for å sikre at de utføres i riktig rekkefølge
    db.run(`CREATE TABLE IF NOT EXISTS users ( // Oppretter en tabell kalt 'users' hvis den ikke allerede eksisterer
        id INTEGER PRIMARY KEY AUTOINCREMENT, // Kolonne 'id' som er primærnøkkel med automatisk inkrementering
        name TEXT NOT NULL, // Kolonne 'name' for tekst, og feltet kan ikke være tomt (NOT NULL)
        email TEXT NOT NULL // Kolonne 'email' for tekst, og feltet kan ikke være tomt (NOT NULL)
    )`); // Avslutter SQL-kommandoen

    db.run(`INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')`); // Setter inn en ny rad i 'users'-tabellen med navn og e-post
    db.run(`INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com')`); // Setter inn en annen rad med navn og e-post
});

db.close(); // Lukker tilkoblingen til databasen
