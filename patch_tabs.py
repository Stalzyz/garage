import re

with open("apps/web/app/dashboard/hr/page.tsx", "r") as f:
    content = f.read()

# 1. Add Import
if "EmployeeActivity" not in content:
    content = content.replace('import { SlideOver } from "@/components/SlideOver"', 'import { SlideOver } from "@/components/SlideOver"\nimport { EmployeeActivity } from "./EmployeeActivity"')

# 2. Add Tab State
if "const [profileTab" not in content:
    content = re.sub(r'const \[isEmailing, setIsEmailing\] = useState\(false\)', 'const [isEmailing, setIsEmailing] = useState(false)\n  const [profileTab, setProfileTab] = useState<"OVERVIEW" | "ACTIVITY">("OVERVIEW")', content)

# 3. Add Tabs to SlideOver UI
tabs_ui = """
               {/* Main Content */}
               <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 w-full mb-2">
                  <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                    <button 
                      onClick={() => setProfileTab("OVERVIEW")} 
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${profileTab === "OVERVIEW" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setProfileTab("ACTIVITY")} 
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${profileTab === "ACTIVITY" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                    >
                      Activity
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 pr-10">
"""
content = content.replace("""              {/* Main Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                
                <div className="flex flex-wrap items-center justify-end gap-2 pr-10 relative z-10 w-full">""", tabs_ui)


# 4. Wrap original content in OVERVIEW check and add ACTIVITY rendering
# Original content goes from ` {/* Generate Document Section */}` down to just before `</div>` (Main Content end).
# To be safe, I'll replace `{/* Generate Document Section */}` with `{profileTab === "OVERVIEW" ? ( <> {/* Generate Document Section */}`
# And replace the closing `</div>` of Main content with `</>) : <EmployeeActivity employeeId={selectedEmployee.id} />}`

content = content.replace('{/* Generate Document Section */}', '{profileTab === "OVERVIEW" ? (\n                <>\n                {/* Generate Document Section */}')

# Now find the end of Main Content
content = content.replace('                )}' + '\n' + '              </div>' + '\n\n' + '            </motion.div>', '                )}' + '\n                </>\n                ) : (\n                  <EmployeeActivity employeeId={selectedEmployee.id} />\n                )}' + '\n' + '              </div>' + '\n\n' + '            </motion.div>')


with open("apps/web/app/dashboard/hr/page.tsx", "w") as f:
    f.write(content)
