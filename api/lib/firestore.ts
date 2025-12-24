import admin from 'firebase-admin';
import { config } from './config.js';

// Initialize Firebase Admin SDK (singleton)
let db: admin.firestore.Firestore | null = null;

function getFirestore(): admin.firestore.Firestore {
    if (db) return db;

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.firebase.projectId,
                clientEmail: config.firebase.clientEmail,
                privateKey: config.firebase.privateKey,
            }),
        });
    }

    db = admin.firestore();
    return db;
}

export interface FirestoreRecapDoc {
    username: string;
    year: number;
    status: 'processing' | 'ready' | 'error';
    processedJson: unknown | null;
    ogImageUrl: string | null;
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
    errorMessage: string | null;
    currentStep: string | null;
    version: number;
}

function getDocId(username: string, year: number): string {
    return `${username.toLowerCase()}:${year}`;
}

export async function getRecap(username: string, year: number): Promise<FirestoreRecapDoc | null> {
    const db = getFirestore();
    const docRef = db.collection('recaps').doc(getDocId(username, year));
    const doc = await docRef.get();

    if (!doc.exists) {
        return null;
    }

    return doc.data() as FirestoreRecapDoc;
}

export async function createRecap(username: string, year: number): Promise<FirestoreRecapDoc> {
    const db = getFirestore();
    const docId = getDocId(username, year);
    const docRef = db.collection('recaps').doc(docId);

    const now = admin.firestore.Timestamp.now();
    const doc: FirestoreRecapDoc = {
        username: username.toLowerCase(),
        year,
        status: 'processing',
        processedJson: null,
        ogImageUrl: null,
        createdAt: now,
        updatedAt: now,
        errorMessage: null,
        currentStep: 'Starting...',
        version: 1,
    };

    await docRef.set(doc);
    return doc;
}

export async function updateRecapReady(
    username: string,
    year: number,
    processedJson: unknown,
    ogImageUrl: string
): Promise<void> {
    const db = getFirestore();
    const docRef = db.collection('recaps').doc(getDocId(username, year));

    await docRef.update({
        status: 'ready',
        processedJson,
        ogImageUrl,
        updatedAt: admin.firestore.Timestamp.now(),
    });
}

export async function updateRecapError(
    username: string,
    year: number,
    errorMessage: string
): Promise<void> {
    const db = getFirestore();
    const docRef = db.collection('recaps').doc(getDocId(username, year));

    await docRef.update({
        status: 'error',
        errorMessage,
        updatedAt: admin.firestore.Timestamp.now(),
    });
}

export async function updateRecapStep(
    username: string,
    year: number,
    currentStep: string
): Promise<void> {
    const db = getFirestore();
    const docRef = db.collection('recaps').doc(getDocId(username, year));

    await docRef.update({
        currentStep,
        updatedAt: admin.firestore.Timestamp.now(),
    });
}

