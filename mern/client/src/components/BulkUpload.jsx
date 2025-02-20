import React, { useState } from "react";
import * as XLSX from 'xlsx';

export default function BulkUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const data = await readExcelFile(file);
      setSelectedFile(file);
      setPreviewData(data);
      setError("");
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellStyles: true,
          cellNF: true
        });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 2 });
        resolve(jsonData);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5050/record/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Reset form and show success
      setSelectedFile(null);
      setPreviewData([]);
      setFileName("");
      window.location.reload(); // Refresh the record list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Create Employee Records by uploading a file</h3>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {fileName && <span className="text-sm text-gray-600 mt-1">{fileName}</span>}
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {previewData.length > 0 && (
        <>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 mb-4"
          >
            {loading ? "Uploading..." : "Upload to MongoDB"}
          </button>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}