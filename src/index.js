import React from 'react'
import ReactDOM from 'react-dom'
import './index.css';
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';


const app = (
  <React.StrictMode>
      <BrowserRouter>
      <App />
      </BrowserRouter>
  </React.StrictMode>
)
const root = document.getElementById('root')

ReactDOM.render(app, root)
