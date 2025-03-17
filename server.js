const express = require('express'); // Importerer Express, et rammeverk for å bygge webapplikasjoner i Node.js
const sqlite3 = require('sqlite3').verbose(); // Importerer SQLite3-biblioteket med verbose-modus for logging
const bodyParser = require('body-parser'); // Importerer body-parser for å håndtere HTTP POST-data
const app = express(); // Oppretter en ny Express-applikasjon
const PORT = 3000; // Definerer portnummeret som serveren vil kjøre på

// Sett opp EJS som template-motor
app.set('view engine', 'ejs'); // Konfigurerer Express til å bruke EJS som malmotor for å rendre HTML-sider

// Middleware for å håndtere JSON og URL-encoded data fra skjemaer
app.use(express.json()); // Tillater at serveren kan håndtere JSON-data
app.use(express.urlencoded({ extended: true })); // Tillater at serveren kan håndtere skjema-data (application/x-www-form-urlencoded)

// Koble til SQLite-databasen
const db = new sqlite3.Database('database.db', (err) => { // Oppretter en tilkobling til SQLite-databasen 'database.db'
    if (err) { // Sjekker om det oppsto en feil ved tilkoblingen
        console.error("Kunne ikke koble til databasen:", err.message); // Logger feilmeldingen til konsollen
    } else { // Hvis tilkoblingen var vellykket
        console.log("Koblet til SQLite-database."); // Logger suksessmelding
    }
});

// Opprett 'users'-tabellen hvis den ikke eksisterer
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )
`, (err) => {
    if (err) { // Sjekker om det oppsto en feil ved opprettelsen av tabellen
        console.error("Feil ved opprettelse av tabell:", err.message); // Logger feilmeldingen
    }
});

// Hovedrute for å vise brukere
app.get('/', (req, res) => { // Definerer en GET-endepunkt på rot-URLen ('/')
    db.all('SELECT * FROM users', [], (err, rows) => { // Kjører en SQL-spørring for å hente alle rader fra 'users'-tabellen
        if (err) { // Sjekker om det oppsto en feil under spørringen
            console.error(err.message); // Logger feilmeldingen til konsollen
            res.status(500).send("Database error!"); // Sender en feilmelding med HTTP-status 500 til klienten
        } else { // Hvis spørringen var vellykket
            res.render('index', { users: rows }); // Render HTML-siden 'index.ejs' og sender med brukerne som data
        }
    });
});

// Rute for å legge til en ny bruker
app.post('/add', (req, res) => { // Definerer en POST-rute for å legge til brukere
    const { name, email } = req.body; // Henter 'name' og 'email' fra forespørselens body

    if (!name || !email) { // Sjekker at begge feltene er fylt ut
        return res.status(400).json({ message: "Navn og e-post er påkrevd" });
    }

    const sql = `INSERT INTO users (name, email) VALUES (?, ?)`; // SQL-kommando for å legge til en bruker
    db.run(sql, [name, email], function (err) { // Kjør SQL-spørringen med parametere
        if (err) { // Sjekker om det oppstår en feil
            console.error("Feil ved innsetting:", err.message);
            return res.status(500).json({ message: "Kunne ikke legge til bruker" });
        }
        res.status(201).json({ message: "Bruker lagt til" }); // Svarer med JSON for å bekrefte at brukeren er lagt til
    });
});

// Rute for å slette en bruker
app.delete("/delete/:id", (req, res) => { // Definerer en DELETE-rute for å slette brukere
    const userId = req.params.id; // Henter ID fra URL-parametere

    const sql = `DELETE FROM users WHERE id = ?`; // SQL-spørring for å slette en bruker basert på ID

    db.run(sql, [userId], function (err) { // Kjør SQL-spørringen med bruker-ID
        if (err) { // Sjekker om det oppsto en feil under sletting
            console.error(err.message);
            res.status(500).json({ message: "Kunne ikke slette brukeren" });
        } else if (this.changes === 0) { // Sjekker om noen rader faktisk ble slettet
            res.status(404).json({ message: "Bruker ikke funnet" });
        } else { // Hvis slettingen var vellykket
            res.status(200).json({ message: "Bruker slettet" });
        }
    });
});
app.use(express.static('public'));

// Start serveren
app.listen(PORT, () => { // Starter Express-serveren og lytter på den definerte porten
    console.log(`Server running at http://localhost:${PORT}/`); // Logger en melding når serveren er startet
});
