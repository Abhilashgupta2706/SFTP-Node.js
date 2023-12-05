console.clear();
console.log("================================ NEW LOGS ================================");
const fs = require('fs');
const path = require('path');
const sftp = require('ssh2-sftp-client');
const ExcelJS = require('exceljs');

const config = {
    host: 'localhost',
    port: 22,
    username: 'abhilash',
    password: 'abhilash'
};

const localFilePath = 'D:\\Practice\\Node.js\\sftp-nodejs\\uploadTest.txt';
const remoteFilePath = 'test1.xlsx';
const downloadedFilePath = 'D:\\Practice\\Node.js\\sftp-nodejs\\test1.xlsx';

// Upload file to server
async function uploadFile(localFilePath, remoteFilePath) {
    const client = new sftp();

    try {
        await client.connect(config);
        console.log('Connected to SFTP ⬆️ 🟢');

        const fileData = fs.createReadStream(localFilePath);
        const remotePath = path.join('/', remoteFilePath);

        await client.put(fileData, remotePath);
        // console.log(`File ${localFilePath} uploaded to ${remotePath}`);

        await client.end();
        console.log('SFTP connection closed ⬆️ 🔴');
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

// Download file from server
async function downloadFile(remoteFilePath, localFilePath) {
    const client = new sftp();

    try {
        await client.connect(config);
        console.log('Connected to SFTP ⬇️ 🟢');

        const remotePath = path.join('/', remoteFilePath);
        const fileData = await client.get(remotePath);

        fs.writeFileSync(localFilePath, fileData, 'utf8');
        // console.log(`File ${remotePath} downloaded to ${localFilePath}`);

        // // Delete the file from the remote server
        // await client.delete(remotePath);
        // console.log('Remote file deleted');

        // Move the file to another folder on the remote server
        const newRemoteFilePath = path.join('/', "/test/", path.basename(remoteFilePath));
        await client.rename(remotePath, newRemoteFilePath);

        await client.end();
        console.log('SFTP connection closed ⬇️ 🔴');
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

// downloadFile(remoteFilePath, downloadedFilePath).then(() => {
//     console.log("Downloaded")
// });

// uploadFile(localFilePath, remoteFilePath).then(() => {
//     console.log("Uploaded")
// });

// Download file from server in JSON format
async function downloadAndConvertToJSON(remoteFilePath, localFilePath) {
    const client = new sftp();

    try {
        await client.connect(config);
        console.log('Connected to SFTP ⬇️ 🟢');

        const remotePath = path.join('/', remoteFilePath);
        const fileData = await client.get(remotePath);

        fs.writeFileSync(localFilePath, fileData, 'utf8');
        console.log(`File ${remotePath} downloaded to ${localFilePath}`);

        // Delete the file from the remote server
        // await client.delete(remotePath);
        // console.log('Remote file deleted');

        // // Move the file to another folder on the remote server
        // const newRemoteFilePath = path.join('/', "/test/", path.basename(remoteFilePath));
        // await client.rename(remotePath, newRemoteFilePath);

        await client.end();
        console.log('SFTP connection closed ⬇️ 🔴');

        // Convert Excel to JSON
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(localFilePath);
        const worksheet = workbook.getWorksheet(1); // Assuming data is in the first sheet

        const jsonData = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) { // Skip header row
                let rowData = {};
                row.eachCell((cell, colNumber) => {
                    // Assuming the first row contains the headers
                    const headerCell = worksheet.getRow(1).getCell(colNumber);
                    rowData[headerCell.value] = cell.value;
                });
                jsonData.push(rowData);
            }
        });

        // jsonData now contains the Excel data in JSON format
        console.log('Excel data converted to JSON:', jsonData);
        return jsonData;

    } catch (err) {
        console.error(`Error: ${err.message}`);
        return null;
    }
}

// Call the function to download and convert the Excel file
downloadAndConvertToJSON(remoteFilePath, downloadedFilePath)
    .then((jsonData) => {
        if (jsonData) {
            console.log('Downloaded and converted to JSON successfully');
            // Now you have jsonData containing the Excel data in JSON format
        } else {
            console.log('Error downloading or converting to JSON');
        }
    });

