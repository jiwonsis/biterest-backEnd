// load enviroment variables
require('dotenv').config();
const {
  PORT: port
} = process.env;

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const db = require('./db');
const api = require('./api');
const jwtMiddleware = require('lib/middlewares/jwt');

db.connect();
const router = new Router();
router.use('/api', api.routes());

const app = new Koa();
app.use(jwtMiddleware);     
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(ctx => {
  ctx.body = 'Hello biterest';
});

app.listen(port, () => {
  console.log(`biterest server is listening to port: ${port}`);
});