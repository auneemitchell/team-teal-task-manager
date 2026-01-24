import { useState } from "react";
import "./App.css";
import Customers from "./components/Customers.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Customers />
    </>
  );
}

export default App;
