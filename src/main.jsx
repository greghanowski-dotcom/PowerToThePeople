import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import this
import App from './App.jsx';
import './styles/globals.css'; // Global styles are imported here

ReactDOM.createRoot(document.getElementById('root')).render(

    <BrowserRouter> {/* Wrap App here */}
      <App />
    </BrowserRouter>

);