import fs from "fs";
import path from "path";
import puppeteer, { PDFOptions } from "puppeteer";
import handlebars from "handlebars";
import PDFMerger from "pdf-merger-js";
import { Client } from "./ClientService";

interface IData {
  clients: Client[];
  hasOddLength: boolean;
}

export interface IFilePath {
  path: string;
  filename: string;
  pageNumber: number;
}

const createPairs: (clients: Client[]) => Client[][] = (clients: Client[]) => {
  let clientTuples = [];
  for (let i = 0; i < clients.length; i += 2) {
    clientTuples.push(clients.slice(i, i + 2));
  }
  return clientTuples;
};

export const generatePDF: (clients: Client[]) => Promise<IFilePath> = async (
  clients: Client[]
) => {
  const milis = new Date().getTime();
  const baseFileName = `${milis}-relatorio`;

  const filename = `${baseFileName}.pdf`;
  const pdfPath = path.join("pdf", filename);

  return Promise.all(
    createPairs(clients)
      .map((clientsTuple) => {
        return {
          clients: clientsTuple,
          hasOddLength: clientsTuple.length % 2 !== 0,
        };
      })
      .map((clientsTuple, index) =>
        generatePDFPage(clientsTuple, baseFileName, index)
      )
  )
    .then((pathList) =>
      pathList.sort((a: IFilePath, b: IFilePath) => a.pageNumber - b.pageNumber)
    )
    .then((orderedPathList) => {
      var merger = new PDFMerger();
      orderedPathList.forEach((path) => merger.add(path.path));
      merger.save(pdfPath);
    })
    .then(() => {
      return { path: pdfPath, filename, pageNumber: -1 };
    });
};

const generatePDFPage: (
  data: IData,
  baseFileName: string,
  pageNumber: number
) => Promise<IFilePath> = async (
  data: IData,
  baseFileName: string,
  pageNumber: number
) => {
  const clientHtml = fs.readFileSync(
    path.join(process.cwd(), "template/partials/client.hbs"),
    "utf8"
  );
  handlebars.registerPartial("client", clientHtml);

  const templateHtml = fs.readFileSync(
    path.join(process.cwd(), "template/main.hbs"),
    "utf8"
  );
  const template = handlebars.compile(templateHtml);
  const html = template(data);

  const filename = `${baseFileName}-page-${pageNumber}.pdf`;
  const pdfPath = path.join("pdf", "temp", filename);

  const options: PDFOptions = {
    format: "A4",
    landscape: true,
    preferCSSPageSize: true,
    path: pdfPath,
    printBackground: true,
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--window-size=800,600"],
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(`data:text/html;charset=UTF-8,${html}`, {
    waitUntil: "networkidle0",
  });

  await page.pdf(options);
  await browser.close();

  return {
    path: pdfPath,
    filename,
    pageNumber: pageNumber,
  };
};
