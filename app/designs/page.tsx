const CSS = `body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
html, body { background: #fff !important; }
.o { display: flex; gap: 28px; flex-wrap: wrap; padding: 40px; font: 400 15px "Helvetica Neue", Helvetica, Arial, sans-serif; }
.o a { color: #111; text-decoration: none; } .o a:hover { text-decoration: underline; }`;

export default function DesignsIndex() {
  return (
    <div className="o">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {Array.from({ length: 10 }, (_, i) => <a key={i} href={`/designs/${i + 1}`}>{i + 1}</a>)}
    </div>
  );
}
