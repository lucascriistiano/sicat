import fs from "fs";
import path from "path";
import puppeteer, { PDFOptions } from 'puppeteer';
import handlebars from "handlebars";
import { IClient, listClients } from "./ClientService";

interface IData {
	clients: IClient[],
	hasOddLength: boolean
}

export const generatePDF = async (data: IData) => {
	var clientHtml = fs.readFileSync(path.join(process.cwd(), 'template/partials/client.hbs'), 'utf8');
	handlebars.registerPartial('client', clientHtml);
	
	var templateHtml = fs.readFileSync(path.join(process.cwd(), 'template/main.hbs'), 'utf8');
	var template = handlebars.compile(templateHtml);
	var html = template(data);

	var milis = new Date().getTime();
	var pdfPath = path.join('pdf', `report-${milis}.pdf`);

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
		args: ['--no-sandbox', '--window-size=800,600'],
		headless: true
	});

	var page = await browser.newPage();
	
	await page.goto(`data:text/html;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
	});

	await page.pdf(options);
  await browser.close();
  
  return pdfPath;
};
