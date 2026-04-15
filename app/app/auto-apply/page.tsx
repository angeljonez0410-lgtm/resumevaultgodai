import AIToolWorkspace from "@/components/AIToolWorkspace";

export default function AutoApplyPage() {
  return (
    <AIToolWorkspace
      title="Auto Apply"
      eyebrow="Application Sprint"
      description="Generate a short list of realistic target roles plus positioning notes so you can apply faster with better fit."
      action="auto-apply"
      resultKey="jobs"
      cta="Find Matches"
      fields={[
        { name: "targetRole", label: "Target Role", placeholder: "Frontend Developer", required: true },
        { name: "location", label: "Location", placeholder: "Remote, Atlanta, GA" },
        {
          name: "experienceLevel",
          label: "Experience Level",
          placeholder: "Mid-level",
          type: "select",
          options: [
            { value: "Entry-level", label: "Entry-level" },
            { value: "Mid-level", label: "Mid-level" },
            { value: "Senior", label: "Senior" },
            { value: "Executive", label: "Executive" },
          ],
        },
        { name: "skills", label: "Skills", placeholder: "React, TypeScript, accessibility, APIs", type: "textarea" },
      ]}
    />
  );
}
