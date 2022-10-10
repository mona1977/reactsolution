// surendra gupta (08-oCT-2022)
import { useEffect } from "react";
import styles from "../styles/Home.module.css";
import Cotter from "cotter"; //  1️⃣  Import Cotter
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { API_KEY_ID } from "../apiKeys";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    var cotter = new Cotter(API_KEY_ID); 
    cotter
      .signInWithLink() 
      .showEmailForm() 
      .then((response) => {
        console.log(response); 
        router.push("/dashboard");
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.subtitle}>Welcome Lead Dashboard</h1>

        
        <div id="cotter-form-container" style={{ width: 300, height: 300 }} />
      </div>
    </>
  );
}
