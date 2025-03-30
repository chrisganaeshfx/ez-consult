const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

exports.createSlot = functions.https.onCall(async (data, context) => {
  const { host, start, end } = data;
  if (!host || !start || !end) throw new functions.https.HttpsError("invalid-argument", "Missing fields");

  const slotDoc = await db.collection("slots").add({
    host,
    entries: [],
    start: admin.firestore.Timestamp.fromDate(new Date(start)),
    end: admin.firestore.Timestamp.fromDate(new Date(end)),
  });

  return { slotId: slotDoc.id };
});

exports.deleteSlot = functions.https.onCall(async (data, context) => {
  const { slotId } = data;
  if (!slotId) throw new functions.https.HttpsError("invalid-argument", "Missing slotId");

  const slotRef = db.collection("slots").doc(slotId);
  const slotSnap = await slotRef.get();
  if (!slotSnap.exists) throw new functions.https.HttpsError("not-found", "Slot not found");

  const entryIds = slotSnap.data().entries || [];

  // Delete slot doc
  const batch = db.batch();
  batch.delete(slotRef);

  // Delete all linked entries
  entryIds.forEach(entryId => {
    const entryRef = db.collection("entries").doc(entryId);
    batch.delete(entryRef);
  });

  await batch.commit();
  return { success: true };
});


exports.joinQueue = functions.https.onCall(async (data, context) => {
  const { slotId, visitor } = data;
  if (!slotId || !visitor) throw new functions.https.HttpsError("invalid-argument", "Missing fields");

  const entryRef = await db.collection("entries").add({
    visitor,
    status: "waiting",
    slotId,
  });

  // Push entryId to slot's entries array
  await db.collection("slots").doc(slotId).update({
    entries: admin.firestore.FieldValue.arrayUnion(entryRef.id)
  });

  return { entryId: entryRef.id };
});

exports.leaveQueue = functions.https.onCall(async (data, context) => {
  const { slotId, entryId } = data;
  if (!slotId || !entryId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing slotId or entryId");
  }

  const slotRef = db.collection("slots").doc(slotId);
  const entryRef = db.collection("entries").doc(entryId);

  const batch = db.batch();
  batch.delete(entryRef);
  batch.update(slotRef, {
    entries: admin.firestore.FieldValue.arrayRemove(entryId)
  });

  await batch.commit();
  return { success: true };
});

exports.advanceQueue = functions.https.onCall(async (data, context) => {
  const { slotId } = data;
  if (!slotId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing slotId");
  }

  const slotRef = db.collection("slots").doc(slotId);
  const slotSnap = await slotRef.get();
  if (!slotSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Slot not found");
  }

  const entryIds = slotSnap.data().entries || [];
  const entryDocs = await db.getAll(...entryIds.map(id => db.collection("entries").doc(id)));

  let currentNotified = null;
  const waitingEntries = [];

  for (const doc of entryDocs) {
    const entry = doc.data();
    if (entry.status === "notified") currentNotified = doc;
    if (entry.status === "waiting") waitingEntries.push(doc);
  }

  // Sort waiting entries by join order (Firestore has no guarantee here)
  waitingEntries.sort((a, b) => a.createTime.toMillis() - b.createTime.toMillis());

  const nextEntry = waitingEntries[0];
  const batch = db.batch();

  if (currentNotified) batch.update(currentNotified.ref, { status: "done" });
  // TODO: Send notification to nextEntry.visitor
  if (nextEntry) batch.update(nextEntry.ref, { status: "notified" });

  await batch.commit();
  return { success: true, nextEntryId: nextEntry?.id || null };
});
