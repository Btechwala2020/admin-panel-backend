import React from "react";
import PyqAdmin from "./PyqAdmin";

export default function App() {
  return (
    <div style={styles.app}>
      <PyqAdmin />
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
};
