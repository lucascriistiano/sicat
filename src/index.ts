import fs from "fs";
import path from "path";
import puppeteer, { PDFOptions } from 'puppeteer';
import handlebars from "handlebars";

const data: IData = {
	people: [
		{
			'name': 'Kilvia Pereira Moura'.toUpperCase(),
			'cpf': '111.111.111-11',
			'rg': '11.111.111',
			'address': '',
			'profession': 'Agricultor(a)',
			'hidrometer': '415513',
			'location': '1',
		},
		{
			'name': 'Lucas Cristiano C Dantas'.toUpperCase(),
			'cpf': '222.222.222-22',
			'rg': '11.111.111',
			'address': '',
			'profession': 'Agricultor(a)',
			'hidrometer': '12345',
			'location': '2',
		},
		// {
		// 	'name': 'Bruno Pereira',
		// 	'cpf': '333.333.333-33',
		// 	'rg': '11.111.111',
		// 	'address': '',
		// 	'profession': 'Agricultor',
		// 	'hidrometer': '54321',
		// 	'location': '3',
		// },
		// {
		// 	'name': 'Kilvia Pereira',
		// 	'cpf': '444.444.444-44',
		// 	'rg': '11.111.111',
		// 	'address': '',
		// 	'profession': 'Agricultor',
		// 	'hidrometer': '54321',
		// 	'location': '3',
		// }
  ]
};

interface IPerson {
  name: string;
  cpf: string;
  rg: string;
  address: string;
  profession: string;
  hidrometer: string;
  location: string;
}

interface IData {
  people: IPerson[]
}

async function createPDF(data: IData) {
	var personHtml = fs.readFileSync(path.join(process.cwd(), 'template/partials/person.hbs'), 'utf8');
	handlebars.registerPartial('person', personHtml);
	
	var templateHtml = fs.readFileSync(path.join(process.cwd(), 'template/main.hbs'), 'utf8');
	var template = handlebars.compile(templateHtml);
	var html = template(data);

	// var milis = new Date().getTime();

	// var pdfPath = path.join('pdf', `${data.name}-${milis}.pdf`);
	var pdfPath = path.join('pdf', 'document.pdf');

	var options: PDFOptions = {
		format: 'A4',
		landscape: true,
		margin: {
			top: "10px",
			bottom: "10px",
			left: "30px",
			right: "30px"
		},
		path: pdfPath
	};

	const browser = await puppeteer.launch({
		args: ['--no-sandbox'],
		headless: true
	});

	var page = await browser.newPage();
	
	await page.goto(`data:text/html;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
	});

	await page.pdf(options);
	await browser.close();
};

createPDF(data);