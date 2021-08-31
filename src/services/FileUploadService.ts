import fs from 'fs';
import { google } from 'googleapis';
import { IFilePath } from './ReportService';

import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';

export const uploadFile = async (path: IFilePath) => {
  fs.readFile('credentials.json', (err, content: string) => {
    if (err) {
      return console.log('Error loading client secret file:', err);
    }
    authorize(JSON.parse(content), (oauth2Client) => performUpload(path, oauth2Client));
  });
}

const performUpload = async (path: IFilePath, oauth2Client) => {
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
  });

  const folderId = '1kMWYIaoh1iwEztG96vN1D0Xjvstdinc7';
  return drive.files.create({
    requestBody: {
      name: path.filename,
      mimeType: 'application/pdf',
      parents: [folderId]
    },
    media: {
      mimeType: 'application/pdf',
      body: fs.createReadStream(path.path)
    }
  })
  .catch((error) => {
    console.log(error);
    return error;
  });
}

const authorize = (credentials: JSON, callback) => {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getAccessToken(oauth2Client, callback);
    }
    oauth2Client.setCredentials(JSON.parse(token));
    callback(oauth2Client);
  });
};

const getAccessToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error('Error retrieving access token', err);
      }
      oAuth2Client.setCredentials(token);

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
      });
      callback(oAuth2Client);
    });
  });
};


// const storeFiles = (auth) => {
//   console.log("auth", JSON.stringify(auth));
//   const drive = google.drive({version: 'v3', auth});
//   var fileMetadata = {
//     'name': 'ImageTest.jpeg'
//   };
//   var media = {
//     mimeType: 'image/jpeg',
//     //PATH OF THE FILE FROM YOUR COMPUTER
//     body: fs.createReadStream('C:/Users/bhavya.jain/Downloads/traveltattoo.jpg')
//   };
//   drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: 'id'
//     }, function (err, file) {
//       if (err) {
//           // Handle error
//           console.error(err);
//       } else {
//           console.log('File Id: ', file.data.id);
//       }
//     });
// };