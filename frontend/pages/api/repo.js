// surendra gupta (08-oCT-2022)
import { CotterValidateJWT } from "cotter-node";

import { CotterAccessToken } from "cotter-token-js";
import axios from "axios"; // Import axios

const checkJWT = (handler) => async (req, res) => {
  
  if (!("authorization" in req.headers)) {
    res.statusCode = 401;
    res.end("Authorization header missing");
    return;
  }
  const auth = await req.headers.authorization;
  const bearer = auth?.split(" ");
  const token = bearer?.length > 0 && bearer[1];

  
  var valid = false;
  try {
    valid = await CotterValidateJWT(token);
  } catch (e) {
    console.log(e);
    valid = false;
  }
  if (!valid) {
    res.statusCode = 403;
    res.end("Authorization header is invalid");
    return;
  }

  
  req.access_token = token;
  handler(req, res);
};

const handler = async (req, res) => {
  
  const decodedToken = new CotterAccessToken(req.access_token);
  const cotterUserID = decodedToken.getID();

  
  let githubAccessToken = "";
  const config = {
    headers: {
      API_KEY_ID: process.env.COTTER_API_KEY_ID,
      API_SECRET_KEY: process.env.COTTER_API_SECRET_KEY,
    },
  };
  try {
    let resp = await axios.get(
      `https://www.cotter.app/api/v0/oauth/token/GITHUB/${cotterUserID}`,
      config
    );
    githubAccessToken = resp.data.tokens?.access_token;
  } catch (err) {
    res.statusCode = 500;
    res.end("Fail getting Github access token from Cotter API");
    return;
  }

  
  const githubConfig = {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${githubAccessToken}`,
    },
  };
  try {
    let resp = await axios.get(
      `https://api.github.com/user/repos`,
      githubConfig
    );
  
    const repoData = resp.data?.map((repo) => ({
      full_name: repo.full_name,
      url: repo.html_url,
    }));
    res.statusCode = 200;
    res.json(repoData);
    return;
  } catch (err) {
    res.statusCode = 500;
    res.end("Fail getting repostories from Github API");
    return;
  }
};

export default checkJWT(handler);
