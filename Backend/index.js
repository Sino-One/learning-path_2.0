const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  // res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "POST");

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// Database
const db = new sqlite3.Database("./data.db", (err) => {
  if (err) {
    console.error("Erreur d'ouverture de la DB:", err.message);
  } else {
    console.log("DB initialisée !");
    db.run(
      `CREATE TABLE IF NOT EXISTS chat (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chatId TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          date TEXT NOT NULL
        )`,
      (tableErr) => {
        if (tableErr)
          console.error("Erreur création de la table:", tableErr.message);
        else console.log("Table 'chat' prête !");
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS qcm (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test INTEGER NOT NULL,
          question TEXT NOT NULL,
          user_answer TEXT NOT NULL,
          good_answer TEXT NOT NULL,
          is_good INTEGER NOT NULL,
          date TEXT NOT NULL

        )`,
      (tableErr) => {
        if (tableErr)
          console.error("Erreur création de la table:", tableErr.message);
        else console.log("Table 'qcm' prête !");
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS code (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test INTEGER NOT NULL,
          question TEXT NOT NULL,
          user_answer TEXT NOT NULL,
          is_good INTEGER NOT NULL
        )`,
      (tableErr) => {
        if (tableErr)
          console.error("Erreur création de la table:", tableErr.message);
        else console.log("Table 'code' prête !");
      }
    );
  }
});

// Stocker message Chat
app.post("/sendChat", (req, res) => {
  const { chatId, role, content, date } = req.body;
  db.run(
    "INSERT INTO chat (chatId, role, content, date) VALUES (?, ?, ?, ?)",
    [chatId, role, content, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get("/getChat/:chatId", (req, res) => {
  const { chatId } = req.params;
  db.all(
    "SELECT * FROM chat WHERE chatId = ? ORDER BY date ASC",
    [chatId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(port, () =>
  console.log(`Backend lancé sur http://localhost:${port}`)
);

// afficher un hello world sur / pour vérifier que le serveur est lancé
app.get("/", (req, res) => {
  res.send("Hello World!");
});
