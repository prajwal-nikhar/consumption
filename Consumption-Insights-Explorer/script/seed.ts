
import { storage } from '../server/storage';
import xlsx from 'xlsx';
import {Consumption} from "../shared/schema";

async function main() {
    console.log('seeding database...');
    const workbook = xlsx.readFile('give_goa_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    // TODO: Make this more robust
    const consumptionData = data.map((row: any) => {
        // Handle Excel's serial date format
        const excelDate = row.DATE;
        // The number of days between Jan 1 1900 and Jan 1 1970 is 25569
        // Multiply by number of milliseconds in a day (24*60*60*1000 = 86400000)
        const date = new Date((excelDate - 25569) * 86400000);

        return {
            location: row['LOCATION OF KWH METERS'],
            date: date.toISOString(),
            totalReading: row['TOTAL  READING(KWH)'],
            isAnomaly: false, // Defaulting to false as it is not in the sheet
        };
    });

    await storage.seedConsumptionData(consumptionData as Consumption[]);
    console.log('database seeded.');
}

main();
