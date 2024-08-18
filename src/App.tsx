import React from 'react';
import './App.css';
import TimeTablePage from "./TimeTablePage/TimeTablePage";
import {BrowserRouter, Route, Routes } from 'react-router-dom';

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

      </Routes>
      </BrowserRouter>
  );
}

export default App;
