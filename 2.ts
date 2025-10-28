import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config(); 

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

const storedValues: Record<string, number> = { PI: 3.14 };
const dataFile = path.join(__dirname, 'data.json');

// טוען את הערכים מהקובץ אם הוא קיים
if (fs.existsSync(dataFile)) {
    const fileData = fs.readFileSync(dataFile, 'utf-8');
    Object.assign(storedValues, JSON.parse(fileData));
}

// פונקציה לשמירה לקובץ
function saveValuesToFile() {
    fs.writeFileSync(dataFile, JSON.stringify(storedValues, null, 2), 'utf-8');
}

// פונקציה לפרשנות של אופרנדים
function parseOperand(input?: string | string[]): number | null {
    if (!input) return null;
    const s = Array.isArray(input) ? input[0] : input;
    const n = Number(s);
    if (!Number.isNaN(n)) return n;

    const val = storedValues[s.toUpperCase()];
    return val !== undefined ? val : null;
}

// -------------------- ROUTES -------------------- //

app.get('/api/value/:name', (req: Request, res: Response) => {
    const key = req.params.name.toUpperCase();
    const value = storedValues[key];
    if (value !== undefined)
        res.json({ [key]: value });
    else
        res.status(404).send(`הערך ${key} לא נמצא.`);
});

app.get('/api/allValues', (req: Request, res: Response) => {
    res.json(storedValues);
});

app.post('/api/store', (req: Request, res: Response) => {
    const name = typeof req.query.name === 'string' ? req.query.name.toUpperCase() : undefined;
    const value = typeof req.query.value === 'string' ? Number(req.query.value) : undefined;

    if (!name || value === undefined) return res.status(400).send('שגיאה: חסר name או value.');
    if (Number.isNaN(value)) return res.status(400).send('שגיאה: Value חייב להיות מספר.');

    storedValues[name] = value;
    saveValuesToFile(); // שמירה לקובץ
    res.json({ message: `הערך ${name} נשמר בהצלחה`, all_values: storedValues });
});

app.put('/api/store', (req: Request, res: Response) => {
    const name = typeof req.query.name === 'string' ? req.query.name.toUpperCase() : undefined;
    const value = typeof req.query.value === 'string' ? Number(req.query.value) : undefined;

    if (!name || value === undefined) return res.status(400).send('שגיאה: חסר name או value.');
    if (!(name in storedValues)) return res.status(404).send(`שגיאה: הערך ${name} לא קיים`);
    if (Number.isNaN(value)) return res.status(400).send('שגיאה: Value חייב להיות מספר.');

    storedValues[name] = value;
    saveValuesToFile(); // שמירה לקובץ
    res.json({ message: `הערך ${name} עודכן בהצלחה`, all_values: storedValues });
});

app.delete('/api/store', (req: Request, res: Response) => {
    const name = typeof req.query.name === 'string' ? req.query.name.toUpperCase() : undefined;
    if (!name) return res.status(400).send('שגיאה: חסר name.');
    if (!(name in storedValues)) return res.status(404).send(`שגיאה: הערך ${name} לא קיים`);

    delete storedValues[name];
    saveValuesToFile(); // שמירה לקובץ
    res.json({ message: `הערך ${name} נמחק בהצלחה`, all_values: storedValues });
});

// -------------------- OPERATIONS -------------------- //

type Operation = (a: number, b: number) => number;

function createOperationRoute(path: string, operation: Operation, opName: string) {
    app.get(path, (req: Request, res: Response) => {

        const getOperand = (val: unknown): string | undefined => {
            if (typeof val === 'string') return val;
            if (Array.isArray(val) && val.length > 0) return val[0];
            return undefined;
        };

        const x = getOperand(req.query.num1);
        const y = getOperand(req.query.num2);
        const a = parseOperand(x);
        const b = parseOperand(y);

        if (a === null || b === null) 
            return res.status(400).send('שגיאה: אופרנדים חסרים או לא חוקיים.');
        if (opName === 'divide' && b === 0) 
            return res.status(400).send('שגיאה: חלוקה באפס אינה חוקית.');

        res.json({ op: opName, x: a, y: b, result: operation(a, b) });
    });
}

createOperationRoute('/api/add', (a, b) => a + b, 'add');
createOperationRoute('/api/subtract', (a, b) => a - b, 'subtract');
createOperationRoute('/api/multiply', (a, b) => a * b, 'multiply');
createOperationRoute('/api/divide', (a, b) => a / b, 'divide');

app.get('/', (req: Request, res: Response) => {
    res.status(200).send(
        'ברוך הבא לשרת המחשבון. נתיבי API: /api/store, /api/add, /api/subtract, /api/multiply, /api/divide, /api/value/:name, /api/allValues'
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




