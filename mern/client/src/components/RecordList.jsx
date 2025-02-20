import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Record = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => props.onSelectRecord(props.record._id)}
        className="h-4 w-4 rounded border-gray-300"
      />
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.record.name}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.record.position}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.record.level}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to={`/edit/${props.record._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            props.deleteRecord(props.record._id);
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  // This method fetches the records from the database.
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/record/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const records = await response.json();
      setRecords(records);
    }
    getRecords();
  }, []);

  // This method will delete a record
  async function deleteRecord(id) {
    await fetch(`http://localhost:5050/record/${id}`, {
      method: "DELETE",
    });
    const newRecords = records.filter((el) => el._id !== id);
    setRecords(newRecords);
  }

  // Add this new function to filter records
  const filteredRecords = () => {
    if (levelFilter === "all") return records;
    return records.filter((record) => record.level === levelFilter);
  };
// Add these new functions to handle selection
const handleSelectRecord = (id) => {
  setSelectedRecords(prev => {
    const newSelected = new Set(prev);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return newSelected;
  });
};
  Modify the existing recordList function to use filteredRecords
  function recordList() {
    return filteredRecords().map((record) => {
      return (
        <Record
          record={record}
          deleteRecord={() => deleteRecord(record._id)}
          key={record._id}
 />
      );
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map(record => record._id)));
    }
  };

  // Add bulk delete function
  async function bulkDelete() {
    // Delete all selected records
    for (const id of selectedRecords) {
      await fetch(`http://localhost:5050/record/${id}`, {
        method: "DELETE",
      });
    }
    // Update records state by filtering out deleted records
    const newRecords = records.filter((record) => !selectedRecords.has(record._id));
    setRecords(newRecords);
    // Clear selection
    setSelectedRecords(new Set());
  }

  // Add new function to filter records
  function getFilteredRecords() {
    return records.filter((record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.level.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Modify the return section to only show bulk delete button
  // This following section will also display the table with the records of individuals.
  return (
    <>
      <div className="flex justify-between items-center p-4">
        <h3 className="text-lg font-semibold">Employee Records</h3>
        {selectedRecords.size > 0 && (
          <button
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 hover:bg-red-700 text-white h-9 rounded-md px-3"
            onClick={bulkDelete}
          >
            Delete Selected ({selectedRecords.size})
          </button>
        )}
        <input
          type="text"
          placeholder="Search Employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&amp;_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === records.length && records.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Position
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Level
                  <select
                    className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="Intern">Intern</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&amp;_tr:last-child]:border-0">
              {recordList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // Modify the recordList function
//  function recordList() {
//    return getFilteredRecords().map((record) => {
//      return (
//       <Record
 //         record={record}
 //         deleteRecord={() => deleteRecord(record._id)}
 //         key={record._id}
 //         isSelected={selectedRecords.has(record._id)}
 //         onSelectRecord={handleSelectRecord}
 //       />
 //     );
 //   });
//  }
}
