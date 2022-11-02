import * as firebase from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { collection, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { Timestamp } from 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD2UbEpGTsgvO6oboROMvQVQ9CnE6t4LJI",
    authDomain: "blog-224bc.firebaseapp.com",
    projectId: "blog-224bc",
    storageBucket: "blog-224bc.appspot.com",
    messagingSenderId: "310432600589",
    appId: "1:310432600589:web:c81e34f967dab2bca83b44",
    measurementId: "G-8GF8CC39G7"
};

firebase.initializeApp(firebaseConfig);

// export const auth = firebase.auth();
export const auth = getAuth();
export const googleAuthProvider = new GoogleAuthProvider();
export const database = getFirestore();
export async function getUserWithUsername(username) {
    const q = query(collection(database, "users"), where("username", "==" , username), limit(1));
    const userDoc = await getDocs(q);
    return userDoc;
}

/**`
 * converts a firestore object to JSON
 * @param {DocumentSnapshot} doc
 */
export function postToJson(doc) {
    const data = doc.data();
    return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
    };
}
// export const firestore = firebase.firestore();
// export const storage = firebase.storage();