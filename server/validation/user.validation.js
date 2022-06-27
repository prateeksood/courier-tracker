const dataValidation = {
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&._])[A-Za-z\d@$!%*#?&._]{6,20}$/,
    name: /^.{4,50}$/
  };
  
  module.exports = dataValidation;