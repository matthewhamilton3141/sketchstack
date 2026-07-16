"use client";

import { createContext, useContext } from "react";

// Controls how NoteNode renders its sub-comments. In the editor they stay
// hidden until you hover a bullet (keeps cards compact); in the read-only shared
// viewer we expand them all, since a static view can't rely on hover.
export const NoteDisplayContext = createContext<{ expandAll: boolean }>({
  expandAll: false,
});

export const useNoteDisplay = () => useContext(NoteDisplayContext);
