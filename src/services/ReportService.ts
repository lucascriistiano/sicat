import fs from "fs";
import path from "path";
import puppeteer, { PDFOptions } from 'puppeteer';
import handlebars from "handlebars";
import { Client } from "./ClientService";

interface IData {
	clients: Client[],
	hasOddLength: boolean
}

export interface IFilePath {
	path: string;
	filename: string;
}

export const generatePDF: (data: IData) => Promise<IFilePath> = async (data: IData) => {
	const clientHtml = fs.readFileSync(path.join(process.cwd(), 'template/partials/client.hbs'), 'utf8');
	handlebars.registerPartial('client', clientHtml);
	
	const templateHtml = fs.readFileSync(path.join(process.cwd(), 'template/main.hbs'), 'utf8');
	const template = handlebars.compile(templateHtml);
	const html = template(data);

	const milis = new Date().getTime();
	const filename = `${milis}-relatorio.pdf`;
	const pdfPath = path.join('pdf', filename);

	const options: PDFOptions = {
		format: 'A4',
		landscape: true,
		margin: {
			top: "10px",
			bottom: "10px",
			left: "30px",
			right: "30px"
		},
		path: pdfPath,
		printBackground: true,
	};

	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--window-size=800,600'],
		headless: true
	});

	const page = await browser.newPage();
	
	await page.goto(`data:text/html;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
	});

	await page.pdf(options);
  await browser.close();
  
  return {
		path: pdfPath,
		filename,
	}
};
