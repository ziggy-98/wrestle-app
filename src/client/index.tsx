import React, { StrictMode } from "react";
import { Container, createRoot } from "react-dom/client";

function App(){
    return (
        <h1>Hello me!</h1>
    )
}

createRoot(document.getElementById("root") as Container).render(
    <StrictMode>
        <App />
    </StrictMode>
);