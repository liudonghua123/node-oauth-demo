// Fill in your client ID and client secret that you obtained
// while registering the application

require("dotenv").config();

const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const route = require('koa-route');
const axios = require('axios');

const {
  CLIENT_ID: clientID,
  CLIENT_SECRET: clientSecret,
  ACCESSTOKEN_URL: accessTokenUrl,
  PROFILE_URL: profileUrl,
} = process.env;

const app = new Koa();

const main = serve(path.join(__dirname + '/public'));

const oauth = async ctx => {
  const requestToken = ctx.request.query.code;
  console.log('authorization code:', requestToken);

  const url = `${accessTokenUrl}?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`;
  console.info(`url: ${url}`);
  const tokenResponse = await axios({
    method: 'post',
    url,
    headers: {
      accept: 'application/json'
    }
  }).catch(function (error) {
    console.log(error);
  });

  const accessToken = tokenResponse.data.access_token;
  console.log(`access token: ${accessToken}`);

  const result = await axios({
    method: 'get',
    url: profileUrl,
    headers: {
      accept: 'application/json',
      Authorization: `token ${accessToken}`
    }
  });
  console.log(result.data);
  const name = result.data.name;

  ctx.response.redirect(`/welcome.html?name=${name}`);
};

app.use(main);
app.use(route.get('/oauth/redirect', oauth));

app.listen(8080);
