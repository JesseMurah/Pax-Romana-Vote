const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = 'KingMurah123'; // Choose a strong password
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) console.error(err);
    console.log(hash);
});