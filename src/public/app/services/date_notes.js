import treeCache from "./tree_cache.js";
import server from "./server.js";
import ws from "./ws.js";

/** @return {NoteShort} */
async function getInboxNote() {
    const note = await server.get('date-notes/inbox/' + dayjs().format("YYYY-MM-DD"), "date-note");

    return await treeCache.getNote(note.noteId);
}

/** @return {NoteShort} */
async function getTodayNote() {
    return await getDateNote(dayjs().format("YYYY-MM-DD"));
}

/** @return {NoteShort} */
async function getDateNote(date) {
    const note = await server.get('date-notes/date/' + date, "date-note");

    return await treeCache.getNote(note.noteId);
}

/** @return {NoteShort} */
async function getMonthNote(month) {
    const note = await server.get('date-notes/month/' + month, "date-note");

    return await treeCache.getNote(note.noteId);
}

/** @return {NoteShort} */
async function getYearNote(year) {
    const note = await server.get('date-notes/year/' + year, "date-note");

    return await treeCache.getNote(note.noteId);
}

/** @return {NoteShort} */
async function createSqlConsole() {
    const note = await server.post('sql-console');

    return await treeCache.getNote(note.noteId);
}

/** @return {NoteShort} */
async function createSearchNote(opts = {}) {
    const note = await server.post('search-note');

    const attrsToUpdate = [
        opts.ancestorNoteId ? { type: 'relation', name: 'ancestor', value: opts.ancestorNoteId } : undefined,
        { type: 'label', name: 'searchString', value: opts.searchStringe }
    ].filter(attr => !!attr);

    if (attrsToUpdate.length > 0) {
        await server.put(`notes/${note.noteId}/attributes`, attrsToUpdate);
    }

    await ws.waitForMaxKnownEntityChangeId();

    return await treeCache.getNote(note.noteId);
}

export default {
    getInboxNote,
    getTodayNote,
    getDateNote,
    getMonthNote,
    getYearNote,
    createSqlConsole,
    createSearchNote
}
