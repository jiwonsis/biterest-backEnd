const Joi = require('joi');
const User = require('db/models/User');
const token = require('lib/token');

// register logic
exports.localRegister = async (ctx) => {
  const { body } = ctx.request;

  const schema = Joi.object({
    displayName: Joi.string().regex(/^[a-zA-Z0-9ㄱ-힣]{3,10}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30)
  });

  const result = Joi.validate(body, schema);

  // Schema Error
  if(result.error) {
    result.error.details.map(message => {
      console.log(message);
    });

    ctx.status = 400;
    ctx.body = result.error.details[0].message;
    return;
  }

  const { displayName, email, password } = body;
  try {
    // check email existancy
    const exists = await User.findExistancy({
      displayName,
      email
    });
    if (exists) {
      ctx.status = 409;
      const key = exists.email === email ? 'email' : 'displayName';
      ctx.body = { key };
      return;
    }
    // create user account
    const user = await User.localRegister({
      displayName, email, password
    });

    ctx.body = user;

    const accessToken = await token.generateToken({
      user: {
        _id: user._id,
        displayName
      }
    }, 'user');
    ctx.cookies.set('access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  } catch (e) {
    ctx.throw(500);
  }
};