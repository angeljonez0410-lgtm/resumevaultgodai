import AIToolWorkspace from "@/components/AIToolWorkspace";

export default function CoverLetterPage() {
  return (
    <AIToolWorkspace
      title="Cover Letter"
      eyebrow="Targeted Outreach"
      description="Create a polished, role-specific cover letter that connects your proof points to the employer's needs."
      action="cover-letter"
      resultKey="letter"
      cta="Write Cover Letter"
      fields={[
        { name: "fullName", label: "Full Name", placeholder: "Jordan Lee" },
        { name: "jobTitle", label: "Job Title", placeholder: "Customer Success Manager", required: true },
        { name: "company", label: "Company", placeholder: "Acme Software", required: true },
        {
          name: "tone",
          label: "Tone",
          placeholder: "Professional",
          type: "select",
          options: [
            { value: "professional", label: "Professional" },
            { value: "confident", label: "Confident" },
            { value: "warm", label: "Warm" },
            { value: "executive", label: "Executive" },
          ],
        },
        { name: "skills", label: "Relevant Skills", placeholder: "CRM, renewals, onboarding, analytics", type: "textarea" },
        { name: "experience", label: "Relevant Experience", placeholder: "Paste accomplishments or background...", type: "textarea" },
        { name: "jobDescription", label: "Job Description", placeholder: "Paste the job description...", type: "textarea", required: true },
      ]}
    />
  );
}
