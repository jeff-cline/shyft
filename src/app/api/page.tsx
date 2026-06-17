import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "shYft Lead API — Documentation",
  description: "Post leads into the shYft system from any external site. Auto-forwards to GoHighLevel.",
};

const ENDPOINT = "https://shyftdoctor.com/api/leads";

const curlExample = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555 123 4567",
    "message": "Interested in the program",
    "source": "partner-landing-page"
  }'`;

const jsExample = `// Server-side (Node, Cloudflare Worker, etc.) — keeps your key secret
await fetch("${ENDPOINT}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.SHYFT_API_KEY,
  },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-123-4567",
    message: "Interested in the program",
    source: "partner-site",
  }),
});`;

const phpExample = `<?php
$ch = curl_init("${ENDPOINT}");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "x-api-key: YOUR_API_KEY",
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "name" => $_POST["name"],
    "email" => $_POST["email"],
    "phone" => $_POST["phone"],
    "message" => $_POST["message"],
    "source" => "wordpress-site",
  ]),
]);
$response = curl_exec($ch);
?>`;

const htmlExample = `<!-- Simplest: a plain HTML form. The key is visible in the page source,
     so only use this on low-risk pages. Server-side posting is preferred. -->
<form action="${ENDPOINT}" method="POST">
  <input type="hidden" name="api_key" value="YOUR_API_KEY" />
  <input type="text"  name="name"    placeholder="Name"  required />
  <input type="email" name="email"   placeholder="Email" required />
  <input type="tel"   name="phone"   placeholder="Phone" />
  <textarea name="message" placeholder="Message"></textarea>
  <input type="hidden" name="source" value="my-other-site" />
  <button type="submit">Send</button>
</form>`;

export default function ApiDocs() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-2">
            shYft Developer API
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-3">Lead Intake API</h1>
          <p className="opacity-80 text-lg">
            Post leads into the shYft system from any external site. Every lead created through
            this endpoint runs the same pipeline as the on-site forms — it is saved to the CRM and
            <strong> automatically forwarded to GoHighLevel</strong> (when a GHL webhook is
            configured) so your drip campaigns fire instantly.
          </p>
        </header>

        <Section title="Endpoint">
          <Code>{`POST ${ENDPOINT}`}</Code>
          <p className="opacity-80 mt-3">
            Accepts <code>application/json</code> or standard form-encoded
            (<code>application/x-www-form-urlencoded</code> / <code>multipart/form-data</code>)
            bodies. CORS is open, so browser <code>fetch</code> and HTML form posts both work.
          </p>
        </Section>

        <Section title="Authentication">
          <p className="opacity-80 mb-3">
            Every request must include your API key, either as a header (preferred) or a body field:
          </p>
          <Code>{`x-api-key: YOUR_API_KEY        // header (recommended, keeps it secret)
api_key=YOUR_API_KEY           // or as a body field (visible in HTML forms)`}</Code>
          <p className="opacity-80 mt-3">
            Get your key from <strong>Admin → Integrations → Lead Intake API</strong> on
            shyftdoctor.com. Keep it secret where you can; rotate it any time from that screen.
          </p>
        </Section>

        <Section title="Request fields">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-ink/20">
                  <th className="py-2 pr-4 font-display">Field</th>
                  <th className="py-2 pr-4 font-display">Required</th>
                  <th className="py-2 font-display">Notes</th>
                </tr>
              </thead>
              <tbody>
                <Row field="name" req="Yes" note="Lead's full name." />
                <Row field="email" req="Yes" note="Valid email. Used to de-duplicate against existing contacts." />
                <Row field="phone" req="No" note="Any format; passed straight through to GoHighLevel." />
                <Row field="message" req="No" note="Free text — what they're interested in. Saved as the intake note." />
                <Row field="source" req="No" note='Where the lead came from. Defaults to "api". Becomes a GHL tag (source:…).' />
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Responses">
          <Code>{`201  { "ok": true, "leadId": "clx…", "forwardedToGHL": true }
401  { "ok": false, "error": "Invalid or missing API key." }
422  { "ok": false, "error": "Both \`name\` and \`email\` are required." }
503  { "ok": false, "error": "Lead API is not enabled. Set a Lead API Key…" }`}</Code>
          <p className="opacity-80 mt-3">
            <code>forwardedToGHL</code> tells you whether a GoHighLevel webhook was configured and
            the lead was pushed to it.
          </p>
        </Section>

        <Section title="Example — cURL">
          <Code>{curlExample}</Code>
        </Section>
        <Section title="Example — JavaScript (server-side)">
          <Code>{jsExample}</Code>
        </Section>
        <Section title="Example — PHP / WordPress">
          <Code>{phpExample}</Code>
        </Section>
        <Section title="Example — plain HTML form">
          <Code>{htmlExample}</Code>
        </Section>

        <footer className="mt-12 pt-6 border-t border-ink/10 opacity-60 text-sm">
          Questions? This API is part of the shYft Doctor backend. Leads land in
          Admin → Leads and sync to GoHighLevel automatically.
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-2xl mb-3 text-brand-y">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-ink text-paper rounded-md p-4 overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">
      <code>{children}</code>
    </pre>
  );
}

function Row({ field, req, note }: { field: string; req: string; note: string }) {
  return (
    <tr className="border-b border-ink/10 align-top">
      <td className="py-2 pr-4 font-mono">{field}</td>
      <td className="py-2 pr-4">{req}</td>
      <td className="py-2 opacity-80">{note}</td>
    </tr>
  );
}
