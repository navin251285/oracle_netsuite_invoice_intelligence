import React, { useMemo, useState } from "react";

function toPrettyJson(data) {
  return JSON.stringify(data, null, 2);
}

export default function PdfOutputCard({ data, collapsed, onToggleCollapse, onCopy, copied }) {
  const [view, setView] = useState("formatted");

  const items = useMemo(() => data?.itemsList || [], [data]);
  const invoicePairs = [
    ["Invoice Number", data?.invoiceNo || "-"],
    ["Invoice Date", data?.invoiceDate || "-"],
    ["Invoice Amount", data?.invoiceAmount || "-"],
    ["Place of Supply", data?.placeofSupply || "-"],
    ["PAN", data?.panNo || "-"],
  ];

  return (
    <section className="card output-card pdf-card fade-in">
      <div className="card-top">
        <div>
          <h3>Extracted PDF Data</h3>
          <p className="section-subtitle">Raw structured data generated from document</p>
        </div>
        <button className="btn-ghost" onClick={onToggleCollapse} type="button">
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className="tabs">
            <button
              className={`tab ${view === "formatted" ? "active" : ""}`}
              onClick={() => setView("formatted")}
              type="button"
            >
              Formatted View
            </button>
            <button
              className={`tab ${view === "raw" ? "active" : ""}`}
              onClick={() => setView("raw")}
              type="button"
            >
              Raw JSON
            </button>
          </div>

          {view === "formatted" ? (
            <>
              <div className="kv-grid">
                {invoicePairs.map(([k, v]) => (
                  <div className="kv-item" key={k}>
                    <span className="kv-key">{k}</span>
                    <span className="kv-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="vendor-box">
                <div>
                  <span className="kv-key">Vendor Name</span>
                  <div className="kv-value strong">{data?.vendorName || "-"}</div>
                </div>
                <div>
                  <span className="kv-key">Customer Address</span>
                  <div className="kv-value">{data?.customerAddress || "-"}</div>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Nature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length ? (
                      items.map((item, idx) => (
                        <tr key={`${item.itemDescription}-${idx}`}>
                          <td>{item.itemDescription || "-"}</td>
                          <td>{item.quantity || "-"}</td>
                          <td>{item.unitPrice || "-"}</td>
                          <td>{item.itemNature || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="table-empty">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="json-wrap">
              <button className="btn-ghost small" onClick={() => onCopy(toPrettyJson(data))} type="button">
                {copied ? "Copied" : "Copy JSON"}
              </button>
              <pre>{toPrettyJson(data)}</pre>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
