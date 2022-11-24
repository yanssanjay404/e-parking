const db = require("../config/db");

class Todo {
  //get all todos.
  async getTodos() {
    let results = await db
      .query(`SELECT * FROM tbl_transaction_in`)
      .catch(console.log);

    return results.rows;
  }

  //create a todo.
  async createTodo(todo) {
    await db
      .query("INSERT INTO todos (title, checked) VALUES ($1, $2)", [
        todo.title,
        false,
      ])
      .catch(console.log);

    return;
  }

  //update a todo.
  async updateTodo(todoId) {
    //get the previous todo.
    let original_todo = await db
      .query(`SELECT * FROM todos WHERE id=$1`, [parseInt(todoId)])
      .catch(console.log);

    //update
    await db
      .query(`UPDATE todos SET checked=$1 WHERE id=$2`, [
        !original_todo.rows[0].checked,
        parseInt(todoId),
      ])
      .catch(console.log);

    return;
  }

  //delete a todo.
  async deleteTodo(todoId) {
    //delete todo
    await db
      .query(`DELETE FROM todos WHERE id=$1`, [parseInt(todoId)])
      .catch(console.log);

    return;
  }

  //=========================
  async createIn(parking) {
    try {
      await db.query(
        "INSERT INTO tbl_transaction_in (code_transaction, time_transaction_in, transportation_type, police_number, status) VALUES ($1, $2, $3, $4, $5)",
        [parking.code_transaction, parking.timeNow, parking.transportation_type, parking.police_number, parking.status]
      ).catch(err => console.log(err));
      console.log("sukses");
      return true;
    } catch (error) {
      console.error(error.stack);
      console.log("gagal");
    }
  }

  async createOut(parking) {
    try {
      await db.query(
        "INSERT INTO tbl_transaction_out (code_transaction_out, time_transaction_out, parking_rates, total_pay, status_out, long_parking) VALUES ($1, $2, $3, $4, $5, $6)",
        [parking.code_transaction_out, parking.timeNow, parking.parking_rates, parking.total_bayar, parking.status_out, parking.lama_parkir]
      ).catch(err => console.log(err));
      console.log("sukses out");
      return true;
    } catch (error) {
      console.error(error.stack);
      console.log("gagal out");
    }
  }

  async getDataIn() {
    let results = await db
      .query(`SELECT * FROM tbl_transaction_in`)
      .catch(console.log);

    return results.rows;
  }

  async getDataOut() {
    let results = await db
      .query(`SELECT * FROM tbl_transaction_out`)
      .catch(console.log);

    return results.rows;
  }
}

module.exports = Todo;
