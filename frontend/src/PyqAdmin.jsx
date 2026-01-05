import { useState } from "react";
import SUBJECTS from "./config/subjects";
import "./PyqAdmin.css";

const YEARS = [
  "2019-20",
  "2020-21",
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
];

const API_URL = "https://admin-panel-backend-jdtt.onrender.com";

export default function PyqAdmin() {
  const [semester, setSemester] = useState("");
  const [subjectKey, setSubjectKey] = useState("");
  const [year, setYear] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const subjectName =
    semester && subjectKey
      ? SUBJECTS[semester].find(s => s.key === subjectKey)?.name
      : "";

  const uploadHandler = async () => {
    if (!semester || !subjectKey || !year || files.length === 0) {
      alert("❌ Sab fields fill karo");
      return;
    }

    const formData = new FormData();
    formData.append("semester", semester);
    formData.append("subject", subjectKey);
    formData.append("subjectName", subjectName);
    formData.append("year", year);
    files.forEach(file => formData.append("files", file));

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Upload Successful");
        setFiles([]);
        setYear("");
        setSemester("");
        setSubjectKey("");
      } else {
        alert("❌ Upload Failed");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server Error (Render sleeping ho sakta hai)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-card">
        <div className="admin-title">PYQ Admin Panel</div>
        <div className="admin-subtitle">
          Upload Previous Year Question Papers
        </div>

        {/* Semester */}
        <div className="form-group">
          <label>Semester</label>
          <select
            value={semester}
            onChange={e => {
              setSemester(e.target.value);
              setSubjectKey("");
            }}
          >
            <option value="">Select Semester</option>
            {Object.keys(SUBJECTS).map(sem => (
              <option key={sem} value={sem}>
                {sem.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        {semester && (
          <div className="form-group">
            <label>Subject</label>
            <select
              value={subjectKey}
              onChange={e => setSubjectKey(e.target.value)}
            >
              <option value="">Select Subject</option>
              {SUBJECTS[semester].map(sub => (
                <option key={sub.key} value={sub.key}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year */}
        <div className="form-group">
          <label>Session / Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="">Select Year</option>
            {YEARS.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Files */}
        <div className="form-group">
          <label>Upload PDF(s)</label>
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={e => setFiles([...e.target.files])}
          />
        </div>

        <button
          className="upload-btn"
          onClick={uploadHandler}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload PDFs"}
        </button>
      </div>
    </div>
  );
}
