const express = require("express");
const router = express.Router();
const Todo = require("../controllers/Parking");
const app = express();
const path = require("path");
const db = require("../config/db");
var moment = require("moment");

//Get all todos.
// router.get("/", async (req, res) => {
//   let todos = await new Todo().getTodos();

//   return res.render("home", {
//     todos,
//   });
// });

//Create a todo.
router.post("/todo", async (req, res) => {
  let { title } = req.body;

  await new Todo().createTodo({ title }, res);

  return res.redirect("/");
});

//Update a todo.
router.put("/todos/:todoId", async (req, res) => {
  let { todoId } = req.params;

  await new Todo().updateTodo(todoId, res);

  let todos = await new Todo().getTodos();

  return res.render("home", {
    todos,
  });
});

//Delete a todo.
router.delete("/todos/:todoId", async (req, res) => {
  let { todoId } = req.params;

  await new Todo().deleteTodo(todoId);

  let todos = await new Todo().getTodos();

  return res.render("home", {
    todos,
  });
});

//==========

//get halaman parkir masuk
router.get("/transaction-in", async (req, res) => {
  return res.render("transaction_in");
});

//proses input data transaksi parkir masuk
router.post("/create", async (req, res) => {
  const transportation_type = req.body.transportation_type;
  let police_number = req.body.police_number;
  police_number = police_number.replace(/ /g, "");
  console.log("transportation_type", transportation_type);

  let timeNow = moment().format("YYYY-MM-DD HH:mm");

  let kode_type;
  if (transportation_type === "motor") {
    kode_type = "MTR";
  } else {
    kode_type = "MBL";
  }

  let nomor = Math.floor(Math.random() * 90 + 10);

  const code_transaction = "P-" + kode_type + police_number + nomor;
  console.log("code_transaction", code_transaction);

  let status = "masuk";

  await new Todo().createIn(
    { code_transaction, timeNow, transportation_type, police_number, status },
    res
  );

  try {
    return res.redirect("/");
  } catch (error) {
    console.log("error insert");
  }
});

//get halaman parkir keluar
router.get("/transaction-out", async (req, res) => {
  return res.render("transaction_out");
});

//proses input data transaksi parkir keluar
router.post("/create-out", async (req, res) => {
  let code_transaction_out = req.body.code_transaction_out;

  const query_transportation_type = `SELECT * 
                   FROM "tbl_transaction_in"
                   WHERE "code_transaction" = $1`;

  let data;
  let convertData;

  let data1;
  let convertData1;
  try {
    //   await db.connect();
    const { rows } = await db.query(query_transportation_type, [
      code_transaction_out,
    ]);
    console.log("rows", rows);

    data = rows.map(function (item) {
      return item["transportation_type"];
    });
    convertData = data.toString();
    console.log("transportation_type =", convertData);

    data1 = rows.map(function (item) {
      return item["time_transaction_in"];
    });

    data1.forEach((letter) => {
      //   console.log("hasilnih", convertData1);
      convertData1 = letter;
    });
    console.log(typeof convertData1);
    console.log("convertData1", convertData1);

    let zone_time = new Date(
      moment(convertData1).add(7, "hours").format("YYYY-MM-DD HH:mm")
    );
    console.log("zone_time", zone_time);

    let timeNow = new Date(moment().add(7, "hours").format("YYYY-MM-DD HH:mm"));
    console.log("timeNow", timeNow);

    let Difference_In_Time = timeNow.getTime() - zone_time.getTime();
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    let konversi_hari = Math.floor(Difference_In_Days);
    console.log("Difference_In_Days", konversi_hari);

    const diff = timeNow.getTime() - zone_time.getTime();
    let msec = diff;
    const hh = Math.floor(msec / 1000 / 60 / 60);
    console.log("hh", hh);
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    console.log("mm", mm);
    const ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    console.log("ss", ss);

    let harga_jampertama_motor = 2000;
    let harga_jampertama_mobil = 5000;

    let lama_parkir = hh + " jam " + mm + " menit";
    console.log("lama_parkir", lama_parkir);

    //total bayar parkir
    let total_bayar;
    if (hh <= 1 && convertData === "mobil") {
      total_bayar = harga_jampertama_mobil;
    } else if (hh <= 1 && convertData === "motor") {
      total_bayar = harga_jampertama_motor;
    } else if (hh < 24 && convertData === "mobil") {
      total_bayar = (hh - 1) * 5000 + 5000;
    } else if (hh < 24 && convertData === "motor") {
      total_bayar = (hh - 1) * 2000 + 2000;
    } else if (hh === 24 && convertData === "mobil") {
      total_bayar = 80000;
    } else if (hh === 24 && convertData === "motor") {
      total_bayar = 40000;
    } else if (konversi_hari > 1 && convertData === "mobil") {
      total_bayar = konversi_hari * 80000 + hh * 5000;
    }
    console.log("total_bayar", total_bayar);

    //tarif parkir atau parking rates
    let parking_rates;
    //if else harga per jam
    if (convertData === "motor") {
      parking_rates = 2000;
    } else {
      parking_rates = 5000;
    }
    console.log("parking_rates =", parking_rates);

    let status_out = "keluar";

    console.log("=================================");
    console.log("=================================");

    await new Todo().createOut(
      {
        code_transaction_out,
        timeNow,
        parking_rates,
        total_bayar,
        status_out,
        lama_parkir,
      },
      res
    );

    return res.render("transaction_out");
  } catch (error) {
    console.error(error.stack);
  }

  //   let sql = `SELECT * FROM tbl_transaction_in WHERE code_transaction = $1 LIMIT 1`;
  //   db.query(sql, [code_transaction_out], (error, results, fields) => {
  //     try {
  //       console.log("GAGAL");
  //       console.log("p",results);
  //       return res.render("transaction_out", {
  //         error: true,
  //         messages: "Postingan tidak ditemukan di DB",
  //       });
  //     } catch (error) {
  //       console.log("BERHASIL");
  //       console.log("results", results[0]);
  //       return res.render("transaction_in", {
  //         error: false,
  //         result: results[0],
  //       });
  //     }
  //   });
});

router.get("/", async (req, res) => {
  let dataIn = await new Todo().getDataIn();
  let dataOut = await new Todo().getDataOut();

  console.log("dataIn", dataIn);
  console.log("dataOut", dataOut);

  return res.render("home", {
    dataIn,
    dataOut
  });
});


module.exports = router;
