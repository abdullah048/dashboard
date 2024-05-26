'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from 'firebase';
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  forwardRef,
  useState
} from 'react';

export const UsersTable = forwardRef(
  (
    {
      users,
      columns,
      setStudents
    }: {
      users: any[];
      columns: any[];
      setStudents: React.Dispatch<React.SetStateAction<never[]>>;
    },
    ref: React.ForwardedRef<HTMLTableElement>
  ) => {
    return (
      <>
        <form className="border shadow-sm rounded-lg max-w-screen-custom">
          <Table ref={ref}>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    className={`${col === 'id' ? 'w-full' : 'min-w-[150px]'}`}
                    key={col}
                  >
                    {col}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  columns={columns}
                  setStudents={setStudents}
                  users={users}
                />
              ))}
            </TableBody>
          </Table>
        </form>
      </>
    );
  }
);

function UserRow({
  user,
  columns,
  setStudents,
  users
}: {
  user: any;
  columns: any;
  users: any;
  setStudents: Dispatch<SetStateAction<never[]>>;
}) {
  const userId = user.id;
  const [loading, setLoading] = useState(false);

  const handleDelete = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    setLoading(true);
    try {
      const studentDocRef = doc(db, 'students', user._id);
      // // Delete the document
      const isDeleted = await deleteDoc(studentDocRef);
      console.log(isDeleted);
      setLoading(false);
      // Update the state
      setStudents(users.filter((user: { id: string }) => user.id !== userId));
    } catch (error) {
      setLoading(false);
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableRow>
      {columns.map((col: string, index: number) => (
        <TableCell key={index}>
          {
            col === 'id' ? user.id : user[col] // Render data based on the extracted key
          }
        </TableCell>
      ))}
      <TableCell className="flex space-x-2">
        <Button
          className="w-full flex gap-2 items-center"
          size="sm"
          loading={loading}
          variant="destructive"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
