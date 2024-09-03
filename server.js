const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // ให้บริการไฟล์ static

// เชื่อมต่อฐานข้อมูล
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, completed INTEGER)");
});

// GET / - ส่งไฟล์ HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /todos - ดึงรายการงานทั้งหมด
app.get('/todos', (req, res) => {
    db.all("SELECT * FROM todos", [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});

// POST /todos - เพิ่มรายการงานใหม่
app.post('/todos', (req, res) => {
    const title = req.body.title;
    db.run("INSERT INTO todos (title, completed) VALUES (?, ?)", [title, 0], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(201).json({ id: this.lastID, title: title, completed: 0 });
    });
});

// PUT /todos/:id - อัปเดตรายการงานที่มีอยู่
app.put('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    const title = req.body.title;
    const completed = req.body.completed;

    db.run("UPDATE todos SET title = ?, completed = ? WHERE id = ?", [title, completed, todoId], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (this.changes === 0) {
            return res.status(404).send('Todo not found');
        }
        res.json({ id: todoId, title: title, completed: completed });
    });
});

// DELETE /todos/:id - ลบรายการงาน
app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);

    db.run("DELETE FROM todos WHERE id = ?", todoId, function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (this.changes === 0) {
            return res.status(404).send('Todo not found');
        }
        res.status(204).send();
    });
});

// เริ่มต้นเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost${port}`);
});


console.log(app.post);