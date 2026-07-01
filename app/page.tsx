import UploadForm from "@/components/UploadForm";

export default function Page() {
  return (
    <main style={_styles.page_container}>
      <h1>syllabus risk assessment</h1>
      <p className="body">
        upload your course syllabus and receive an analysis of assignments and
        assessments that may be vulnerable to generative AI misuse.
      </p>
      <UploadForm />
      <footer></footer>
    </main>
  );
}

const _styles = {
  page_container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
};
