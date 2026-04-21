import { useState } from "react";

export function useModalState() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting,   setDeleting]   = useState<any | null>(null);

  return {
    modalOpen,
    editing,
    deleteOpen,
    deleting,
    openNew:     ()          => { setEditing(null); setModalOpen(true); },
    openEdit:    (row: any)  => { setEditing(row);  setModalOpen(true); },
    closeModal:  ()          => { setModalOpen(false); setEditing(null); },
    openDelete:  (row: any)  => { setDeleting(row);  setDeleteOpen(true); },
    closeDelete: ()          => { setDeleteOpen(false); setDeleting(null); },
  };
}