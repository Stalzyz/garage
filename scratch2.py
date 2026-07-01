import re

# Fix ProBuilder.tsx
with open("apps/web/src/components/builder/ProBuilder.tsx", "r") as f:
    pb = f.read()
pb = pb.replace("setSelectedBlock(id)", "if(id) setSelectedBlock(id)")
pb = pb.replace("setSelectedBlock(block.id)", "if(block.id) setSelectedBlock(block.id)")
with open("apps/web/src/components/builder/ProBuilder.tsx", "w") as f:
    f.write(pb)

# Fix Proposals
with open("apps/web/app/dashboard/crm/proposals/[id]/page.tsx", "r") as f:
    prop = f.read()
prop = prop.replace("margin: [10, 10, 10, 10]", "margin: [10, 10]")
with open("apps/web/app/dashboard/crm/proposals/[id]/page.tsx", "w") as f:
    f.write(prop)

# Fix Invoices
with open("apps/web/app/dashboard/finance/invoices/[id]/page.tsx", "r") as f:
    inv = f.read()
inv = inv.replace("const res = await response.json()", "const res: any = await response.json()")
with open("apps/web/app/dashboard/finance/invoices/[id]/page.tsx", "w") as f:
    f.write(inv)

# Fix Onboarding
with open("apps/web/app/dashboard/hr/onboarding/page.tsx", "r") as f:
    onb = f.read()
if "import { toast }" not in onb:
    onb = onb.replace("import { useState } from \"react\"", "import { useState } from \"react\"\nimport { toast } from \"sonner\"")
with open("apps/web/app/dashboard/hr/onboarding/page.tsx", "w") as f:
    f.write(onb)

print("TS Errors fixed!")
