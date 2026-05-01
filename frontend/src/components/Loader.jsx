import React from "react";

export default function Loader({ stage }) {
  return (
    <section className="loader-wrap fade-in">
      <div className="spinner" aria-label="Processing" />
      <p className="loader-text">
        {stage === "extracting" ? "Extracting PDF data..." : "Sending to NetSuite..."}
      </p>
    </section>
  );
}
