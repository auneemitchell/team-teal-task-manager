import { useState } from "react";
import "./App.css";
import Customers from "./components/Customers.jsx";
import Tasks from "./components/Tasks.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div style={{ display: "grid", gap: 24 }}>
        <Tasks />
      </div>
    </>
  );
}

export default App;
