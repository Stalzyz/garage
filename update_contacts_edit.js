const fs = require('fs');
let content = fs.readFileSync('apps/web/app/dashboard/crm/contacts/page.tsx', 'utf-8');

// 1. Add editing state
if (!content.includes('const [editingContactId')) {
  content = content.replace(
    'const [isAddOpen, setIsAddOpen] = useState(false)',
    'const [isAddOpen, setIsAddOpen] = useState(false)\n  const [editingContactId, setEditingContactId] = useState<string | null>(null)'
  );
}

// 2. Add handleEditClick
if (!content.includes('const handleEditClick')) {
  const handleEditCode = `
  const handleEditClick = (contact: any) => {
    setEditingContactId(contact.id);
    setFormData({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      companyId: contact.companyId || "",
      tier: contact.tier || "BRONZE"
    });
    setIsAddOpen(true);
  };
`;
  content = content.replace('const handleCreateContact = async', handleEditCode + '\n  const handleCreateContact = async');
}

// 3. Modify handleCreateContact to handle updates
if (content.includes('await fetchApi("/crm/contacts", {')) {
  content = content.replace(
    `      await fetchApi("/crm/contacts", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Contact created successfully")`,
    `      if (editingContactId) {
        await fetchApi(\`/crm/contacts/\${editingContactId}\`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        toast.success("Contact updated successfully")
      } else {
        await fetchApi("/crm/contacts", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Contact created successfully")
      }`
  );
  
  // also reset editingContactId
  content = content.replace(
    'setIsAddOpen(false)\n      setFormData',
    'setIsAddOpen(false)\n      setEditingContactId(null)\n      setFormData'
  );
}

// 4. Update the "Add Contact" button and onClose logic to clear edit state
content = content.replace(
  'onClick={() => setIsAddOpen(true)}',
  'onClick={() => { setEditingContactId(null); setFormData({ firstName: "", lastName: "", email: "", phone: "", companyId: "", tier: "BRONZE" }); setIsAddOpen(true); }}'
);
content = content.replace(
  'onClose={() => setIsAddOpen(false)}',
  'onClose={() => { setIsAddOpen(false); setEditingContactId(null); }}'
);
content = content.replace(
  'title="Add New Contact"',
  'title={editingContactId ? "Edit Contact" : "Add New Contact"}'
);
content = content.replace(
  '{isSubmitting ? "Saving..." : "Save Contact"}',
  '{isSubmitting ? "Saving..." : editingContactId ? "Update Contact" : "Save Contact"}'
);

// 5. Add onClick to the card
const oldCardDiv = '<div key={contact.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">';
const newCardDiv = '<div key={contact.id} onClick={() => handleEditClick(contact)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">';

content = content.replace(oldCardDiv, newCardDiv);

fs.writeFileSync('apps/web/app/dashboard/crm/contacts/page.tsx', content);
