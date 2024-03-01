import "dotenv/config";

import { join } from "path";
import express, { static as st } from "express";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import AuthFactory from "./utils/AuthFactory.js";
import { initDatabase } from "./db.js";
import ItemFactory from "./utils/ItemFactory.js";
import TokenFactory from "./utils/TokenFactory.js";
import { UserModel } from "./models/User.model.js";
import axios from "axios";
import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(st(join(__dirname, "public")));

async function init() {
  console.log(`Connecting to database ${process.env.MONGO_URL}...`);
  await initDatabase();
  console.log(`Connected to MongoDB!`);
}

app.post("/signup", async (req, res) => {
  try {
    const response = await AuthFactory.createAccount(req.body);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const response = await AuthFactory.authAccount(req.body);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/token", async (req, res) => {
  try {
    const response = await AuthFactory.authByToken(req.body.token);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/items", async (req, res) => {
  try {
    if (!(await checkAdministrator(req))) {
      res.status(403).send({
        status: false,
        code: "NO_RIGHTS",
        message: "You have no rights for this operation.",
      });
      return;
    }
    const response = await ItemFactory.createOrUpdate(req.body);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});
const apiKey = '5F3EF321-C49C-4A10-8358-6B0840B6AA7D';

app.get('/api/crypto', (req, res) => {
  axios.get('https://rest.coinapi.io/v1/exchangerate/BTC/USD', {
    headers: {
      'X-CoinAPI-Key': apiKey
    }
  })
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});


async function checkAdministrator(req) {
  if (!req.headers.authentication) {
    return false;
  }
  const chunks = req.headers.authentication.split("JWT ");
  if (chunks.length != 2) return false;
  const res = await TokenFactory.validateToken(chunks[1]);
  if (!res) return false;
  return (
    (await UserModel.exists({
      _id: res.payload._id,
      role: "admin",
    }).exec()) != null
  );
}

app.get("/items/:id", async (req, res) => {
  try {
    const response = await ItemFactory.get(req.params.id);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});
app.delete("/items/:id", async (req, res) => {
  try {
    const response = await ItemFactory.deleteDoc(req.params.id);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});
app.post("/items/page", async (req, res) => {
  try {
    const response = await ItemFactory.getPage(req.body);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/users/page", async (req, res) => {
  try {
    if (!(await checkAdministrator(req))) {
      res.status(403).send({
        status: false,
        code: "NO_RIGHTS",
        message: "You have no rights for this operation.",
      });
      return;
    }
    const response = await AuthFactory.getUsersPage(req.body);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    if (!(await checkAdministrator(req))) {
      res.status(403).send({
        status: false,
        code: "NO_RIGHTS",
        message: "You have no rights for this operation.",
      });
      return;
    }
    const response = await AuthFactory.getUser(req.params.id);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/users", async (req, res) => {
  try {
    if (!(await checkAdministrator(req))) {
      res.status(403).send({
        status: false,
        code: "NO_RIGHTS",
        message: "You have no rights for this operation.",
      });
      return;
    }
    const response = await AuthFactory.updateUser(req.body);
    if (!response.status) {
      res.status(400).send(response);
      return;
    }
    res.status(200).send(response);
  } catch (e) {
    res.sendStatus(500);
  }
});
app.get('weather.html', (req, res) => {
  res.sendFile(path.join(__dirname, './weather.html'))

})

app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT ${process.env.PORT}`);
});

init();
