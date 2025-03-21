// Fill in your client ID and client secret that you obtained
// while registering the application
require("dotenv").config();
const Koa = require("koa");
const path = require("path");
const serve = require("koa-static");
const route = require("koa-route");
const axios = require("axios");

const {
  CLIENT_ID: clientID,
  CLIENT_SECRET: clientSecret,
  REDIRECT_URI: redirect_uri,
  ACCESSTOKEN_URL: accessTokenUrl,
  PROFILE_URL: profileUrl,
} = process.env;

const app = new Koa();

const main = serve(path.join(__dirname + "/public"));

const oauth = async (ctx) => {
  const code = ctx.request.query.code;
  console.log("authorization code:", code);

  const url = `${accessTokenUrl}?grant_type=authorization_code&client_id=${clientID}&client_secret=${clientSecret}&code=${code}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}`;
  console.log("try to get access token using url:", url);
  const tokenResponse = await axios({
    method: "post",
    url: url,
  }).catch(function (error) {
    console.log(error.response.status);
    console.log(error.response.data);
  });

  const accessToken = tokenResponse.data.access_token;
  console.log(`access token: ${accessToken}`);

  console.log("try to get user info like mobile phone number");
  const result = await axios({
    method: "post",
    url: profileUrl,
    headers: {
      accept: "application/json",
    },
    data: {
      access_token: accessToken,
    },
  });
  console.log(result.data);
  const name = result.data.attributes.nickName;

  ctx.response.redirect(`/welcome.html?name=${name}`);
};

app.use(main);
app.use(route.get("/oauth/redirect", oauth));

app.listen(8080);
