const router = require('express').Router();
const {body} = require('express-validator');
const {register} = require('../login/registerController');
const {login} = require('../login/loginController');
const {getUser} = require('../login/getUserController');
const {forgetPassword} = require('../login/forgetPassword');

router.post('/register', [
    // body('name',"The name must be of minimum 3 characters length")
    // .notEmpty()
    // .escape()
    // .trim()
    // .isLength({ min: 3 }),
    body('email',"Invalid email address")
    // .notEmpty()
    // .escape()
    // .trim().isEmail(),
    // body('password',"The Password must be of minimum 4 characters length").notEmpty().trim().isLength({ min: 4 }),
], register);


router.post('/login',[
    // body('email',"Invalid email address")
    // .notEmpty()
    // .escape()
    // .trim().isEmail(),
    // body('password',"The Password must be of minimum 4 characters length").notEmpty().trim().isLength({ min: 4 }),
],login);

router.get('/getuser',getUser);
router.put('/forgetadmin',forgetPassword);

module.exports = router;