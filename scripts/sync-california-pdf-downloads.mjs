import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDirectory = path.join(root, "output/pdf");
const publicDirectory = path.join(root, "public/statecourse/downloads/california");
const files = [
  "California_Prelicense_Master_Compliance_and_Filing_Readiness.pdf",
  "California_RE306_Principles_Application_Draft.pdf",
  "California_RE306_Principles_Submission_Binder.pdf",
  "California_RE306_Practice_Application_Draft.pdf",
  "California_RE306_Practice_Submission_Binder.pdf",
  "California_RE306_Mortgage_Loan_Brokering_and_Lending_Application_Draft.pdf",
  "California_RE306_Mortgage_Loan_Brokering_and_Lending_Submission_Binder.pdf",
  "California_RE336_Anatoliy_Kanevsky_Instructor_Qualification_Binder.pdf",
];

fs.mkdirSync(publicDirectory, { recursive: true });

for (const file of files) {
  const source = path.join(sourceDirectory, file);
  const destination = path.join(publicDirectory, file);
  if (!fs.existsSync(source)) throw new Error(`Missing California submission PDF: ${file}`);
  const header = fs.readFileSync(source, { encoding: null, flag: "r" }).subarray(0, 5).toString("ascii");
  if (header !== "%PDF-") throw new Error(`Invalid PDF header: ${file}`);
  fs.copyFileSync(source, destination);
}

console.log(`Published ${files.length} California submission PDFs.`);
