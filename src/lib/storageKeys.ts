// Shared localStorage keys so the editor and the shared-diagram viewer's
// "Open a copy" action read/write the same working diagram. LEGACY is the
// pre-rebrand key, read once so existing diagrams migrate over.
export const DIAGRAM_STORAGE_KEY = "sketchstack:diagram:v1";
export const LEGACY_DIAGRAM_STORAGE_KEY = "sysdesign:diagram:v1";
