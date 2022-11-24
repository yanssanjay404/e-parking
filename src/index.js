const express = require("express");

const cors = require("cors");

const app = express();

const todoRoutes = require('./routes/routes');

app.use(express.json());

app.use(cors());

app.use(express.urlencoded({
    extended:true
}));

app.set("view engine","ejs");

app.set("views","src/views/pages");

app.use('/static',express.static(`${__dirname}/public`));

app.use(todoRoutes);

const PORT = process.env.PORT  || 5000;

app.listen(PORT, () => {
    console.log(`aplikasi berjalan pada port ${PORT}`)
});