import React from "react";

function parseNetSuiteMessage(apiResponse) {
  try {
    const parsedOuter =
      typeof apiResponse?.response === "string"
        ? JSON.parse(apiResponse.response)
        : apiResponse?.response;

    const message = parsedOuter?.response?.message || parsedOuter?.message || "No message available";
    const success =
      typeof parsedOuter?.response?.success === "boolean"
        ? parsedOuter.response.success
        : apiResponse?.status_code >= 200 && apiResponse?.status_code < 300;

    return { success, message };
  } catch {
    return {
      success: apiResponse?.status_code >= 200 && apiResponse?.status_code < 300,
      message: String(apiResponse?.response || "No message available"),
    };
  }
}

export default function NetSuiteResponseCard({ data, collapsed, onToggleCollapse, onCopy, copied }) {
  const { success, message } = parseNetSuiteMessage(data || {});

  return (
    <section className={`card output-card netsuite-card ${success ? "success" : "error"} fade-in`}>
      <div className="card-top">
        <div>
          <h3>NetSuite Response</h3>
          <p className="section-subtitle">Final system validation and transaction result</p>
        </div>
        <button className="btn-ghost" onClick={onToggleCollapse} type="button">
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className="verdict-row">
            <div className={`status-pill ${success ? "ok" : "bad"}`}>
              <span className="status-dot" />
              {success ? "Accepted" : "Rejected"}
            </div>
            <div className="status-code">Status Code: {data?.status_code ?? "-"}</div>
          </div>

          <p className="verdict-message">{message}</p>

          <div className="json-wrap">
            <button className="btn-ghost small" onClick={() => onCopy(JSON.stringify(data, null, 2))} type="button">
              {copied ? "Copied" : "Copy Response JSON"}
            </button>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </>
      ) : null}
    </section>
  );
}
