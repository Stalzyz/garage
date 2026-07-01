import re

with open('apps/web/app/dashboard/lms/page.tsx', 'r') as f:
    content = f.read()

header_addition = """
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400/80">Learning Hub</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              {firstName ? `Keep going, ${firstName}` : "Your Learning Hub"}
            </h1>
            <p className="text-white/40 mt-2 text-base">
              {totalCourses > 0 
                ? `${totalCourses} course${totalCourses > 1 ? 's' : ''} enrolled — ${inProgress.length} in progress`
                : "Discover and enroll in courses to begin your journey"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/lms/courses"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Browse Catalog
            </Link>
            <Link 
              href="/dashboard/lms/builder"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <BookOpen className="w-4 h-4" /> Create Course
            </Link>
          </div>
        </div>
"""

content = re.sub(r'<div className="relative z-10">.*?</div>', header_addition.strip(), content, flags=re.DOTALL)

with open('apps/web/app/dashboard/lms/page.tsx', 'w') as f:
    f.write(content)
