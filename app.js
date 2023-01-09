const expressFileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const fastCSV = require('@fast-csv/parse');
const app = require('express')();


const port = 3000

app.use(expressFileUpload());

app.post('/parseCSV', async (req, res) => {
  const file = req.files.file;
  if (!file || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const fileUploadPath = __dirname + '/csvFiles/' + file.name;

  // Use the mv() method to place the file somewhere on your server
  file.mv(fileUploadPath, (err) => {
    if (err)
      return res.status(500).send(err); 
    });

  const uploadedFileReadStream = fs.createReadStream(fileUploadPath);
  const csvRows = [];
  const regexExp = /^[0-9]*$/;
  const checkIdentifier = (identifier) => regexExp.test(identifier);

    uploadedFileReadStream
    .pipe(fastCSV.parse({ headers: true, ignoreEmpty: true }))
    .validate((data) => checkIdentifier(data.Identifier))
    .on('data-invalid', (row, rowNumber) => console.log('Invalid Row', row, rowNumber))
    .on('error', error => console.error('error', error))
    .on('data', row => csvRows.push(row))
    .on('end', (rowCount) => res.status(200).json({csvRows, rowCount}));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

