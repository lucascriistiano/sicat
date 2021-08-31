require("dotenv").config();

import express from "express";
import { listClients, saveClientList } from "./services/ClientService";
import { uploadFile } from "./services/FileUploadService";
import { generatePDF, IFilePath } from "./services/ReportService";

const app = express();

app.use(express.json());

const PORT = 8000;

app.get("/api/clients", (req, res) => {
  listClients()
    .then((clients) => res.send(clients))
    .catch((error) => res.status(500).send({ error: error }));
});

app.post("/api/clients", (req, res) => {
  const clientsToSave = req.body;
  saveClientList(clientsToSave)
    .then((clients) => res.status(201).send(clients))
    .catch((error) => res.status(500).send({ error: error }));
});

app.post("/api/reports/clients/download", (req, res) => {
  listClients()
    .then((clients) => generatePDF(clients))
    .then((pdfPath: IFilePath) => res.download(pdfPath.path))
    .catch((error) => res.status(500).send({ error: error }));
});

app.post('/api/reports/clients', (req, res) => {
	listClients()
	.then(clients => generatePDF(clients))
	.then((pdfPath: IFilePath) => uploadFile(pdfPath))
	.then(() => res.status(200).end())
	.catch(error => res.status(500).send({ error }));
});

app.get("/healthCheck", (req, res) => {
  res.send({ version: "1.0.0" });
});

app.get("/oauth2callback", (req, res) => {
  const query = req.query;
  console.log(query);
  res.send(query);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
