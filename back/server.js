const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const db = require('./db/todo')
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000']
}));
const port = 3010;


// Получить список всех ToDo
app.get('/api/todos', (req, res) => {
    db.all('SELECT * FROM ToDo', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// Получить ToDo по id
app.get('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM ToDo WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!row) {
            res.status(404).send('Not Found');
        } else {
            res.json(row);
        }
    });
});

app.post('/api/todos', (req, res) => {
    console.log(req.body, req.body.title, req.body.description, req.body.isDone)
    const { title, description, isDone } = req.body;
    db.run('INSERT INTO ToDo (title, description, isDone) VALUES (?, ?, ?)', [title, description, isDone], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            const newTodo = { id: this.lastID, title, description, isDone };
            res.status(200).json(newTodo);
        }
    });
});

app.patch('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    const { title, description, isDone } = req.body;
    db.run('UPDATE ToDo SET title = ?, description = ?, isDone = ? WHERE id = ?', [title, description, isDone, id], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (this.changes === 0) {
            res.status(404).send('Not Found');
        } else {
            res.sendStatus(204);
        }
    });
});

app.delete('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM ToDo WHERE id = ?', [id], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (this.changes === 0) {
            res.status(404).send('Not Found');
            console.log('no');
        } else {
            res.sendStatus(200);
            console.log(id, 'deleted');
        }
    });
});

app.delete('/api/todos', (req, res) => {
    const sql = 'DELETE FROM ToDo';
    db.run(sql, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('All ToDo were deleted successfully');
        res.sendStatus(200);
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});