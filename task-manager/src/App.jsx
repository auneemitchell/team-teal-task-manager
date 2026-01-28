import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import Customers from "./components/Customers.jsx";
import Tasks from "./components/Tasks.jsx";



export default function App() {
  return (
    <Routes>
      {/*
        A static route:
      */}
      <Route path="/" element={<Home />} />

      {/*
        A dynamic route with a parameter.
        In the rendered component, you can read { id } via useParams().
      */}
      <Route path="/task/:id" element={<TaskDetail />} />
    </Routes>
  );
}
