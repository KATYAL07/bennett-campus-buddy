import fs from 'fs';
import path from 'path';

export default async function ContactsPage() {
  const filePath = path.join(process.cwd(), 'data', 'contacts.json');
  let contacts = [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    contacts = JSON.parse(raw);
  } catch (err) {
    contacts = [];
  }

  // Group contacts by category
  const categories = {};
  contacts.forEach((c) => {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        {/* Planted typo flaw: "Informaton" */}
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Useful Campus Contacts & Informaton
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Static directory of university academic departments, hostel offices, central library, and 24x7 emergency contacts.
        </p>
      </div>

      {/* Contributor Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900">
        <span className="font-bold block mb-1">Open Source Contribution Note:</span>
        These placeholder records are stored statically in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">data/contacts.json</code>. You can contribute to Campus Buddy during Hacktoberfest by replacing placeholder phone numbers, office room codes, and email addresses with current Bennett University campus directory information!
      </div>

      {/* Planted flaw: Contacts page has NO search input */}

      <div className="space-y-8">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1.5">
              {category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-stone-200 rounded-md p-4 shadow-sm text-xs space-y-2 hover:border-stone-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{c.name}</h3>
                      <div className="text-stone-500 font-medium">{c.role}</div>
                    </div>
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Placeholder
                    </span>
                  </div>

                  <div className="space-y-1 text-stone-700 pt-1 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 w-16">Email:</span>
                      <a href={`mailto:${c.email}`} className="text-emerald-800 hover:underline">
                        {c.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 w-16">Phone:</span>
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 w-16">Location:</span>
                      <span>{c.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 w-16">Hours:</span>
                      <span>{c.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
