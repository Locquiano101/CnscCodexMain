import { useState } from "react";
import "./App.css";
import api from "./api/home_page_api";
export default function App() {
  const [response, setResponse] = useState(null);

  async function handleClick() {
    console.log("Frontend: button clicked");
    const payload = { clicked: true, at: new Date().toISOString() };

    try {
      const res = await api.post("/test", payload);
      console.log("Frontend got response:", res.data);
      setResponse(res.data);
    } catch (err) {
      console.error("Axios error:", err);
      setResponse({ error: err.message });
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Button (Axios)</h1>
      <button onClick={handleClick}>Click me (call backend)</button>
      <pre style={{ marginTop: 20 }}>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
