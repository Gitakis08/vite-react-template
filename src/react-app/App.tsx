import { useState } from "react";
import "./App.css";

function normalizePhone(value: string) {
  let phone = value.trim().replace(/[\s\-().]/g, "");

  if (/^69\d{8}$/.test(phone) || /^2\d{9}$/.test(phone)) {
    phone = "+30" + phone;
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return null;
  }

  return phone;
}

export default function App() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  const normalizedPhone = normalizePhone(phone);
  const canSubmit = Boolean(normalizedPhone) && !loading;

  async function startCall() {
    const toNumber = normalizePhone(phone);

    if (!toNumber) {
      setStatus("Βάλε έγκυρο τηλέφωνο.");
      setStatusType("error");
      return;
    }

    setLoading(true);
    setStatus("Ξεκινάει η κλήση...");
    setStatusType("");

    try {
      const response = await fetch("/api/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ toNumber })
      });

      const data = await response.json();

      if (data.ok) {
        setStatus("Η κλήση ξεκίνησε!");
        setStatusType("success");
      } else {
        setStatus("Δεν μπόρεσε να ξεκινήσει η κλήση.");
        setStatusType("error");
      }
    } catch {
      setStatus("Σφάλμα σύνδεσης.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Κάλεσέ με</h1>

        <p>
          Συμπλήρωσε το τηλέφωνό σου και πάτησε το κουμπί για να ξεκινήσει η
          κλήση.
        </p>

        <label htmlFor="phone">Τηλέφωνο</label>

        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+302130179137 ή 2130179137"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setStatus("");
            setStatusType("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSubmit) {
              startCall();
            }
          }}
        />

        <div className="hint">
          Μπορείς να γράψεις ελληνικό αριθμό με ή χωρίς +30.
        </div>

        <button disabled={!canSubmit} onClick={startCall}>
          {loading ? "Καλεί..." : "Κάλεσέ με"}
        </button>

        <div className={`status ${statusType}`}>{status}</div>
      </section>
    </main>
  );
}
