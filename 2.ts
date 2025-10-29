import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const storedValues: Record<string, number> = { PI: 3.14 };
const dataFile = path.join(__dirname, 'data.json');

if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf-8');
    Object.assign(storedValues, JSON.parse(data));
}


function saveToFile() {
    fs.writeFileSync(dataFile, JSON.stringify(storedValues, null, 2), 'utf-8');
}


function parseOperand(value?: string | string[]): number | null {
    if (!value) return null;
    const str = Array.isArray(value) ? value[0] : value;
    const num = Number(str);
    if (!isNaN(num)) return num;

    const saved = storedValues[str.toUpperCase()];
    return saved !== undefined ? saved : null;
}


function createOperation(pathName: string, func: (a: number, b: number) => number, name: string) {
    app.get(pathName, (req: Request, res: Response) => {
    const num1 = parseOperand(req.query.num1 as string | string[] | undefined);
const num2 = parseOperand(req.query.num2 as string | string[] | undefined);


        if (num1 === null || num2 === null)
            return res.status(400).send("שגיאה: חסרים ערכים או שהם לא חוקיים.");

        if (name === 'divide' && num2 === 0)
            return res.status(400).send("שגיאה: חלוקה באפס אינה אפשרית.");

        const result = func(num1, num2);
        res.json({ פעולה: name, num1, num2, תוצאה: result });
    });
}

createOperation('/api/add', (a, b) => a + b, 'add');
createOperation('/api/subtract', (a, b) => a - b, 'subtract');
createOperation('/api/multiply', (a, b) => a * b, 'multiply');
createOperation('/api/divide', (a, b) => a / b, 'divide');


app.post('/api/store', (req: Request, res: Response) => {
    const name = req.query.name?.toString().toUpperCase();
    const value = Number(req.query.value);

    if (!name || isNaN(value))
        return res.status(400).send("שגיאה: חסר name או value לא תקין.");

    storedValues[name] = value;
    saveToFile();
    res.json({ הודעה: `הערך ${name} נשמר בהצלחה`, כל_הערכים: storedValues });
});

app.put('/api/store', (req: Request, res: Response) => {
    const name = req.query.name?.toString().toUpperCase();
    const value = Number(req.query.value);

    if (!name || isNaN(value))
        return res.status(400).send("שגיאה: חסר name או value לא תקין.");

    if (!(name in storedValues))
        return res.status(404).send(`שגיאה: הערך ${name} לא קיים.`);

    storedValues[name] = value;
    saveToFile();
    res.json({ הודעה: `הערך ${name} עודכן בהצלחה`, כל_הערכים: storedValues });
});

app.delete('/api/store', (req: Request, res: Response) => {
    const name = req.query.name?.toString().toUpperCase();

    if (!name)
        return res.status(400).send("שגיאה: חסר name.");

    if (!(name in storedValues))
        return res.status(404).send(`שגיאה: הערך ${name} לא קיים.`);

    delete storedValues[name];
    saveToFile();
    res.json({ הודעה: `הערך ${name} נמחק בהצלחה`, כל_הערכים: storedValues });
});



app.get('/api/value/:name', (req: Request, res: Response) => {
    const key = req.params.name.toUpperCase();
    const value = storedValues[key];
    if (value === undefined)
        return res.status(404).send(`שגיאה: הערך ${key} לא נמצא.`);
    res.json({ [key]: value });
});

app.get('/api/allValues', (req: Request, res: Response) => {
    res.json(storedValues);
});


app.get('/', (req: Request, res: Response) => {
    res.send('ברוך הבא לשרת המחשבון. נסי נתיבים כמו /api/add או /api/allValues');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
