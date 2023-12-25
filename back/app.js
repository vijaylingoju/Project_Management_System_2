import express from 'express';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { spawn } from 'child_process';

const port = 5009;
const app = express();
app.use(cors());

const excelFilePath = path.join('C:\\MyReact\\Profile_Management_System\\back\\result_data.xlsx');
console.log(excelFilePath);

try {
  if (fs.existsSync(excelFilePath)) {
    const workbook = xlsx.readFile(excelFilePath);
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    app.get('/api/getExcelData', (req, res) => {
      res.json(jsonData);
    });

    app.post('/api/updateData', (req, res) => {
      const pythonScriptPath = path.join('C:\\MyReact\\Profile_Management_System\\back\\update_data.py');

      const pythonProcess = spawn('python', [pythonScriptPath]);

      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Error executing Python script: ${data}`);
        res.status(500).json({ message: 'Internal Server Error' });
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          // Python script executed successfully
          // Optionally, you can send a response to the frontend
          res.json({ message: 'Python script executed successfully' });
        } else {
          console.error(`Python script exited with code ${code}`);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      });
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } else {
    console.error(`File not found: ${excelFilePath}`);
  }
} catch (error) {
  console.error('Error reading the Excel file:', error);
}
