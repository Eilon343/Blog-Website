import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { doc,  onSnapshot } from "firebase/firestore";
import { database } from "../lib/firebase";

export function useUserData(){
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState(null);
  
    useEffect(() => {
      let unsubscribe;
  
      if (user) {
        try{
            const docRef = doc(database,  "users", user.uid);
            unsubscribe = onSnapshot(docRef, (doc) => {
              setUsername(doc.data()?.username);
            });
        } catch(ex) {
            console.log(ex);
        }
      } else {
        setUsername(null);
      }
  
      return unsubscribe;
    }, [user]);

    return {user, username};
}