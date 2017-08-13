var bcrypt = require('bcrypt-nodejs');

var username = 'username';
var password = 'password';

var passwordchanged = 'passwordchanged';

var hash = bcrypt.hashSync(password);

var hashedPassword1114AMPST = '$2a$10$AdewC4wFb2AZtCpL3EQIFOnOyn6ximGp6z7xyxAWNtgDzPvqWzKE.';

console.log('hashed password: ', hash.length);

var compare = bcrypt.compare(passwordchanged, hashedPassword1114AMPST, (error, result) => {
  console.log('Comparing string to hash: ', error, result);
});
