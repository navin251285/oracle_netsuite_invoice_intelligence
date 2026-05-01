import React, { useMemo, useState } from "react";
import Loader from "./components/Loader";
import NetSuiteResponseCard from "./components/NetSuiteResponseCard";
import PdfOutputCard from "./components/PdfOutputCard";
import UploadCard from "./components/UploadCard";

const API_URL = import.meta.env.VITE_API_URL || "/api/process-invoice";

const USE_MOCK = false;

const mockResult = {
  pdf_output: {
    invoiceNo: "1",
    vendorName: "JANARDHAN JHA",
    panNo: "APAPJ2758M",
    invoiceDate: "4/08/2025",
    invoiceAmount: "8000",
    placeofSupply: "Maharashtra",
    customerAddress:
      "20th Floor, Lotus Garndeur building, near Country Club, Off Vera Desai Road, Andheri West, Mumbai-400053",
    itemsList: [
      {
        itemCode: "",
        itemDescription: "COOK",
        quantity: "1",
        unitPrice: "4000",
        itemNature: "Services",
      },
      {
        itemCode: "",
        itemDescription: "COOK",
        quantity: "1",
        unitPrice: "4000",
        itemNature: "Services",
      },
    ],
  },
  net_suite_api_response: {
    status_code: 200,
    response:
      '{"response":{"success":false,"code":421,"message":"Reference No. 1 is a duplicate for this vendor","data":{"order_id":""}}}',
  },
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockProcessInvoice() {
  await wait(1200);
  await wait(900);
  return mockResult;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("extracting");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [pdfCollapsed, setPdfCollapsed] = useState(false);
  const [netCollapsed, setNetCollapsed] = useState(false);
  const [copiedType, setCopiedType] = useState("");

  const hasResult = useMemo(() => Boolean(result?.pdf_output && result?.net_suite_api_response), [result]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 1800);
  };

  const copyJson = async (jsonText, type) => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopiedType(type);
      showToast("Copied to clipboard");
      window.setTimeout(() => setCopiedType(""), 1200);
    } catch {
      showToast("Unable to copy");
    }
  };

  const processFile = async () => {
    if (!file || loading) return;

    setError("");
    setResult(null);
    setLoading(true);
    setStage("extracting");

    try {
      await wait(900);
      setStage("sending");

      let payload;
      if (USE_MOCK) {
        payload = await mockProcessInvoice(file);
      } else {
        const formData = new FormData();
        formData.append("file", file);

        let response;
        try {
          response = await fetch(API_URL, {
            method: "POST",
            body: formData,
          });
        } catch {
          throw new Error("Unable to reach backend API. Check backend server and frontend proxy configuration.");
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        payload = await response.json();
      }

      setResult(payload);
      showToast("Processing complete");
    } catch (err) {
      setError(err.message || "Something went wrong while processing PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg">
      <main className="container">
        <header className="hero fade-in">
          <h1>PDF Intelligence Engine</h1>
          <p>Extract → Validate → NetSuite</p>
        </header>

        <UploadCard file={file} disabled={loading} onFileSelect={setFile} onSubmit={processFile} />

        {loading ? <Loader stage={stage} /> : null}

        {error ? <div className="error-box fade-in">{error}</div> : null}

        {hasResult ? (
          <section className="pipeline fade-in">
            <PdfOutputCard
              data={result.pdf_output}
              collapsed={pdfCollapsed}
              onToggleCollapse={() => setPdfCollapsed((v) => !v)}
              onCopy={(text) => copyJson(text, "pdf")}
              copied={copiedType === "pdf"}
            />

            <div className="flow-indicator">PDF → NetSuite</div>

            <NetSuiteResponseCard
              data={result.net_suite_api_response}
              collapsed={netCollapsed}
              onToggleCollapse={() => setNetCollapsed((v) => !v)}
              onCopy={(text) => copyJson(text, "netsuite")}
              copied={copiedType === "netsuite"}
            />
          </section>
        ) : null}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
