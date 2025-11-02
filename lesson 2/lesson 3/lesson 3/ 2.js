"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json()); // חובה ל־POST/PUT JSON
const PORT = parseInt(process.env.PORT || '3000', 10);
// -------------------- STORAGE -------------------- //
const storedValues = { PI: 3.14 };
const dataFile = path_1.default.join(__dirname, 'data.json');
// טען קובץ אם קיים
if (fs_1.default.existsSync(dataFile)) {
    const fileData = fs_1.default.readFileSync(dataFile, 'utf-8');
    Object.assign(storedValues, JSON.parse(fileData));
}
function saveValuesToFile() {
    fs_1.default.writeFileSync(dataFile, JSON.stringify(storedValues, null, 2), 'utf-8');
}
// -------------------- HELPER -------------------- //
function parseOperand(input) {
    if (!input)
        return null;
    const s = Array.isArray(input) ? input[0] : input;
    const n = Number(s);
    if (!Number.isNaN(n))
        return n;
    const val = storedValues[s.toUpperCase()];
    return val !== undefined ? val : null;
}
// -------------------- CRUD ROUTES -------------------- //
app.get('/api/value/:name', (req, res) => {
    const key = req.params.name.toUpperCase();
    const value = storedValues[key];
    if (value !== undefined)
        res.json({ [key]: value });
    else
        res.status(404).send(`הערך ${key} לא נמצא.`);
});
app.get('/api/allValues', (req, res) => {
    res.json(storedValues);
});
app.post('/api/store', (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.toUpperCase() : undefined;
    const value = typeof req.body.value === 'number' ? req.body.value : Number(req.body.value);
    if (!name || value === undefined || Number.isNaN(value))
        return res.status(400).send('שגיאה: חסר name או value או value אינו מספר.');
    storedValues[name] = value;
    saveValuesToFile();
    res.json({ message: `הערך ${name} נשמר בהצלחה`, all_values: storedValues });
});
app.put('/api/store', (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.toUpperCase() : undefined;
    const value = typeof req.body.value === 'number' ? req.body.value : Number(req.body.value);
    if (!name || value === undefined || Number.isNaN(value))
        return res.status(400).send('שגיאה: חסר name או value או value אינו מספר.');
    if (!(name in storedValues))
        return res.status(404).send(`שגיאה: הערך ${name} לא קיים`);
    storedValues[name] = value;
    saveValuesToFile();
    res.json({ message: `הערך ${name} עודכן בהצלחה`, all_values: storedValues });
});
app.delete('/api/store', (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name.toUpperCase() : undefined;
    if (!name)
        return res.status(400).send('שגיאה: חסר name.');
    if (!(name in storedValues))
        return res.status(404).send(`שגיאה: הערך ${name} לא קיים`);
    delete storedValues[name];
    saveValuesToFile();
    res.json({ message: `הערך ${name} נמחק בהצלחה`, all_values: storedValues });
});
function createOperationRoute(path, operation, opName) {
    app.get(path, (req, res) => {
        const getOperand = (val) => {
            if (typeof val === 'string')
                return val;
            if (Array.isArray(val) && val.length > 0)
                return val[0];
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
// -------------------- HOME -------------------- //
app.get('/', (req, res) => {
    res.status(200).send('ברוך הבא לשרת המחשבון. נתיבי API: /api/store, /api/add, /api/subtract, /api/multiply, /api/divide, /api/value/:name, /api/allValues');
});
// -------------------- START SERVER -------------------- //
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
