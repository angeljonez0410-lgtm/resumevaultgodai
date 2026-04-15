import AIToolWorkspace from "@/components/AIToolWorkspace";

export default function JobAnalyzerPage() {
  return (
    <AIToolWorkspace
      title="Job Analyzer"
      eyebrow="ATS Intelligence"
      description="Paste a job description and get the keywords, match gaps, and resume changes needed to compete."
      action="analyze-job"
      resultKey="analysis"
      cta="Analyze Job"
      fields={[
        { name: "jobTitle", label: "Job Title", placeholder: "Senior Product Manager", required: true },
        { name: "company", label: "Company", placeholder: "Acme Health", required: true },
        {
          name: "jobDescription",
          label: "Job Description",
          placeholder: "Paste the full job description here...",
          type: "textarea",
          required: true,
        },
      ]}
    />
  );
}
