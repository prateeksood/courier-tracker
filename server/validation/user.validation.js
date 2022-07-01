module.exports= {
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?._])[A-Za-z\d@$!%*#?&._]{6,20}$/,
    name: /^[A-Za-z\s]{4,50}$/,
    contactNumber: /^[5-9][0-9]{9}$/
  };