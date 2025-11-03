import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const storedValues: Record<string, number> = { 'PI': 3.14 };


function parseOperand(input?: string | string[]): number | null {
    if (!input) return null;
    const s = Array.isArray(input) ? input[0] : input;
    const n = Number(s);
    if (!Number.isNaN(n)) return n;

    const val = storedValues[s.toUpperCase()];
    return val !== undefined ? val : null;
}

app.get('/', (req: Request, res: Response) => {
    res.status(200).send(
        'ברוך הבא לשרת המחשבון. נתיבי API: /api/store, /api/add, /api/subtract, /api/multiply, /api/divide'
    );
});


app.get('/api/store', (req: Request, res: Response) => {
    const nameQuery = req.query.name;
    const valueQuery = req.query.value;

    const name = typeof nameQuery === 'string' ? nameQuery.toUpperCase() : undefined;
    const value = typeof valueQuery === 'string' ? valueQuery : undefined;

    if (!name || !value) {
        return res.status(400).send('שגיאה: חסר name או value.');
    }

    const n = Number(value);
    if (Number.isNaN(n)) {
        return res.status(400).send('שגיאה: Value חייב להיות מספר.');
    }

    storedValues[name] = n;
    res.json({ message: 'הערך נשמר בהצלחה', name, value: n, all_values: storedValues });
});

type Operation = (a: number, b: number) => number;

function createOperationRoute(path: string, operation: Operation, opName: string) {
    app.get(path, (req: Request, res: Response) => {
  ד
        const getOperand = (val: unknown): string | undefined => {
            if (typeof val === 'string') return val;
            if (Array.isArray(val) && val.length > 0) return val[0];
            return undefined;
        };

        const a = parseOperand(getOperand(req.query.x));
        const b = parseOperand(getOperand(req.query.y));

        if (a === null || b === null) {
            return res.status(400).send('שגיאה: אופרנדים חסרים או לא חוקיים.');
        }

        if (opName === 'divide' && b === 0) {
            return res.status(400).send('שגיאה: חלוקה באפס אינה חוקית.');
        }

        res.json({ op: opName, x: a, y: b, result: operation(a, b) });
    });
}


createOperationRoute('/api/add', (a, b) => a + b, 'add');
createOperationRoute('/api/subtract', (a, b) => a - b, 'subtract');
createOperationRoute('/api/multiply', (a, b) => a * b, 'multiply');
createOperationRoute('/api/divide', (a, b) => a / b, 'divide');


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
