import mysql from 'mysql2/promise';

const dbConnect = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '55555das',       // No password as per phpMyAdmin config
      database: 'lightning_kids',
      port: 3306          // Specify the port
    });

    console.log('Connected to the MySQL database.');

    // Example query
    // const [rows, fields] = await connection.execute('SELECT * FROM parent');
    // console.log(rows);
    return connection;
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
};

export default dbConnect;

// import mysql from 'mysql2/promise';

// const dbConnect = async () => {
//   try {
//     const connection = await mysql.createConnection({
//       host: 'sql313.infinityfree.com',
//       user: 'if0_38207537',
//       password: 'XPwaPskzNVj',       // No password as per phpMyAdmin config
//       database: 'if0_38207537_lkc_admin',
//       port: 3306          // Specify the port
//     });

//     console.log('Connected to the MySQL database.');

//     // Example query
//     const [rows, fields] = await connection.execute('SELECT * FROM parent');
//     console.log(rows);
//     return connection;
//   } catch (err) {
//     console.error('Database connection failed:', err.message);
//   }
// };

// export default dbConnect;

// dbConnect();
