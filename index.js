const connectMongo=require('./db');

connectMongo();

const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/user', require('./routes/user'));
app.use('/api/comment', require('./routes/comments'));

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})