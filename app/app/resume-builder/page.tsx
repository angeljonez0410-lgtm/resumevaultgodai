import AIToolWorkspace from "@/components/AIToolWorkspace";

export default function ResumeBuilderPage() {
  return (
    <AIToolWorkspace
      title="Resume Builder"
      eyebrow="ATS Resume Engine"
      description="Build a targeted resume draft using the job description, your skills, and measurable wins."
      action="resume-builder"
      resultKey="resume"
      cta="Build Resume"
      fields={[
        { name: "fullName", label: "Full Name", placeholder: "Jordan Lee" },
        { name: "currentRole", label: "Current Role", placeholder: "Operations Manager" },
        { name: "jobTitle", label: "Target Job Title", placeholder: "Senior Operations Manager", required: true },
        { name: "company", label: "Target Company", placeholder: "Acme Logistics" },
        { name: "skills", label: "Skills", placeholder: "Excel, SQL, process improvement, leadership", type: "textarea" },
        { name: "experience", label: "Experience", placeholder: "Paste your work history or rough bullets...", type: "textarea" },
        { name: "achievements", label: "Achievements", placeholder: "Revenue increased 20%, led 12-person team...", type: "textarea" },
        { name: "jobDescription", label: "Job Description", placeholder: "Paste the full role description...", type: "textarea", required: true },
      ]}
    />
  );
}
