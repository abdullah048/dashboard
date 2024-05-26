'use client';
import { Button } from '@/components/ui/button';
import { extractKeys, sortUsersById } from '@/lib/utils';
import { db } from 'firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import { LoaderCircle } from 'lucide-react';
import Papa from 'papaparse';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { UsersTable } from './users-table';

export default function IndexPage() {
  const [students, setStudents] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const studentData = results.data as any;
          const extractedKeys = extractKeys(studentData) as any;
          setColumns(extractedKeys);
          setStudents(studentData);
          // Batch write to Firestore
          const batch = writeBatch(db);
          const studentCollectionRef = collection(db, 'students');

          studentData.forEach((student: any) => {
            const newDocRef = doc(studentCollectionRef); // Create a new document reference with auto-generated ID
            batch.set(newDocRef, student);
          });

          // Commit the batch
          await batch.commit();
          console.log('Batch write completed successfully');
          location.reload();
        }
      });
    } else {
      console.log('No file selected');
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const studentCollectionRef = collection(db, 'students');
      const snapshot = await getDocs(studentCollectionRef);
      const studentsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id, // Include Firestore document ID as _id
          id: data.id, // Use the ID from your CSV file as id
          ...data
        };
      }) as any;
      setStudents(studentsData);
      const extractedKeys = extractKeys(studentsData) as any;
      setColumns(extractedKeys);
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const availableWidth = pageWidth - margin * 2;
    const columnCount = columns.length;

    // Adjust column width based on the number of columns and available width
    const columnWidth = availableWidth / columnCount;

    const tableColumn = columns;
    const tableRows: any = [];

    sortUsersById(students).forEach((student) => {
      const studentData = columns.map((column) => student[column] || '');
      tableRows.push(studentData);
    });

    // Prepare dynamic column styles
    const columnStyles: Record<string, any> = {};
    columns.forEach((col, index) => {
      columnStyles[index] = { cellWidth: columnWidth };
    });

    doc.text('Student Records', margin, 10);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'striped',
      styles: {
        fontSize: 5, // Adjust font size
        cellPadding: 1, // Add cell padding for better readability
        overflow: 'linebreak' // Ensure text wraps within cells
      },
      headStyles: {
        fillColor: [22, 160, 133], // Customize the header color
        textColor: [255, 255, 255],
        fontSize: 5
      },
      columnStyles,
      margin: { left: 10, right: 10, top: 30 }
    });

    doc.save('students.pdf');
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex justify-between  mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
        <div className="flex space-x-2 items-center">
          <Button
            disabled={students.length === 0 || loading}
            className="w-full max-w-40"
            variant="secondary"
            onClick={exportToPDF}
          >
            Export to PDF
          </Button>
          <Button
            disabled={students.length > 0 || loading}
            className="w-full max-w-40"
            variant="secondary"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            Import
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        hidden
        id="fileInput"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
      />
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoaderCircle className="w-10 h-10 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-2xl font-medium">
            Please import data to view
          </span>
        </div>
      ) : (
        <UsersTable
          ref={tableRef}
          setStudents={setStudents}
          users={sortUsersById(students)}
          columns={columns}
        />
      )}
    </main>
  );
}
