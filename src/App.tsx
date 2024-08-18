import React from 'react';
import './App.css';
import TimeTablePage from "./TimeTablePage/TimeTablePage";
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import DiagramPage from "./Diagram/DiagramPage";

function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <TimeTablePage/>
        }/>
          <Route path="/TimeTable/:routeID/:direct" element={
              <TimeTablePage/>
          }></Route>
          <Route path="/Diagram/:routeID" element={
              <DiagramPage/>
          }></Route>

      </Routes>
      </BrowserRouter>
  );
}

export default App;
