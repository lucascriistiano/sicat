import express from 'express';
import { listClients } from './services/ClientService';
import { generatePDF } from './services/ReportService';

const app = express();

app.use(express.json());

const PORT = 8000;

app.get('/api/clients', (req, res) => {
  listClients()
    .then(clients => res.send(clients))
    .catch(error => res.status(500).send({ error: error }));
});

app.post('/api/reports/clients', (req, res) => {
	listClients()
	.then(clients => generatePDF({ clients: clients, hasOddLength: clients.length % 2 !== 0 }))
	.then((pdfPath) => {
		// const file = `${__dirname}`;
		const file = pdfPath;
		res.download(file);
	})
	.catch(error => res.status(500).send({ error: error }));
});

app.get('/healthCheck', (req, res) => {
  res.send({ version: '1.0.0' });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
