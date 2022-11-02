import { async } from "@firebase/util";
import { auth, googleAuthProvider } from "../lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../lib/context";
import { doc, writeBatch, getDoc } from "firebase/firestore";
import { database } from "../lib/firebase";
import debounce from "lodash.debounce";

export default function EnterPage(props) {
  const { user, username } = useContext(UserContext);
  console.log(username);

  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  );
  //sign in with google
  function SignInButton() {
    const signInWithGoogle = async () => {
      await signInWithPopup(auth, googleAuthProvider);
    };

    return (
      <button className="btn-google" onClick={signInWithGoogle}>
        <img src={"/google.png"} /> Sign in with Google
      </button>
    );
  }

  function SignOutButton() {
    return <button onClick={() => signOut(auth)}>Sign Out</button>;
  }
  function UsernameForm() {
    const [formValue, setFormValue] = useState("");
    const [isVaild, setIsVaild] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext);

    useEffect(() => {
      checkUserName(formValue);
    }, [formValue]);

    const onChange = (e) => {
      const val = e.target.value.toLowerCase();
      const regEx = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

      if (val.length < 3) {
        setFormValue(val);
        setLoading(false);
        setIsVaild(false);
      }
      if (regEx.test(val)) {
        setFormValue(val);
        setLoading(true);
        setIsVaild(false);
      }
    };

    const checkUserName = useCallback(
      debounce(async (username) => {
        if (username.length >= 3) {
          console.log("here");
          const docRef = doc(database, "usernames", username);
          const docSnap = await getDoc(docRef);
          console.log("Firestore read executed!");
          setIsVaild(!docSnap.exists());
          setLoading(false);
        }
      }, 500),
      []
    );

    const onSubmit = async (e) => {
      e.preventDefault();
      //get ref of docs
      const userDoc = doc(database, "users", user.uid);
      const usernameDoc = doc(database, "usernames", formValue);
      //commit refs
      const batch = writeBatch(database);
      batch.set(userDoc, {
        username: formValue,
        photoURL: user.photoURL,
        displayName: user.displayName,
      });
      batch.set(usernameDoc, { uid: user.uid });

      await batch.commit();
    };
    function UserNameMessage({ username, isVaild, loading }) {
      if (loading) {
        return <p>Checking...</p>;
      } else if (isVaild) {
        return <p className="text-success">{username} is available!</p>;
      } else if (username && !isVaild) {
        return <p className="text-danger">That username is taken!</p>;
      } else {
        return <p></p>;
      }
    }

    return (
      !username && (
        <section>
          <h3>Choose Username</h3>
          <form onSubmit={onSubmit}>
            <input
              name="username"
              placeholder="username"
              value={formValue}
              onChange={onChange}
            />

            <UserNameMessage
              username={formValue}
              isVaild={isVaild}
              loading={loading}
            />

            <button type="submit" className="btn-green" disabled={!isVaild}>
              Choose
            </button>

            <h3>Debug State</h3>
            <div>
              Username: {formValue}
              <br />
              Loading: {loading.toString()}
              <br />
              Username Vaild: {isVaild.toString()}
            </div>
          </form>
        </section>
      )
    );
  }
}
