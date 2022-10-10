//Surendra Gupta (09-Oct-2022)
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Cotter from "cotter";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_KEY_ID } from "../apiKeys";

export default function Dashboard() {
  const [err, seterr] = useState(null);
  const [repos, setrepos] = useState([]);

  
  useEffect(() => {
    getLeads();
  }, []);

  const getLeads = async () => {
    // 1️⃣  Get Access Token for Logged-in User
    var cotter = new Cotter(API_KEY_ID); 
    const accessToken = await cotter.tokenHander.getAccessToken();

    // 2️⃣ Make the request to our `/leads` endpoint
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken?.token}`,
      },
    };
    try {
      let resp = await axios.get("/leads", config);
      setrepos(resp.data);
    } catch (err) {
      seterr(JSON.stringify(err.response?.data));
    }
  };

  const connectToGithub = async () => {
    var cotter = new Cotter(API_KEY_ID);
    const accessToken = await cotter.tokenHandler.getAccessToken();
    cotter.connectSocialLogin("GITHUB", accessToken?.token); // pass in the provider's name
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.subtitle}>
          Current Leads List
        </h1>
        {
        <div style={{ color: "#FF0000" }}>{err}</div>

        {/* If there's no Github access token, show a button to connect a Github account */}
        {err?.includes("Fail getting Github access token from Cotter API") && (
          <div className={styles.card} onClick={connectToGithub}>
            Connect Github
          </div>
        )}

        {/*  3️⃣ Show the list of Leads */}
        <div className={styles.main}>
          {repos.map((repo) => (
            <div className={styles.card}>
              <h3>{repo.Fullname}</h3><br />
              {repo.PhoneNumber}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
