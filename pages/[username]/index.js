import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";
import { database, getUserWithUsername, postToJson } from "../../lib/firebase";
import { collection, getDocs, limit, where, orderBy, getDoc } from "firebase/firestore";
import { query as fireQuery } from "firebase/firestore";


export async function getServerSideProps({ query }) {
    const { username } = query;
    const userDoc = await getUserWithUsername(username);
    let user = null;
    let posts = null;
    
    if (userDoc) {
        user = userDoc.data();
        console.log(user);
        const postsQuery = fireQuery(collection(database, "posts"),
        where("username", "==", username),
        where("published", "==", true ),
        orderBy("createdAt", "desc"),
        limit(5));

        posts =  (await getDocs(postsQuery)).docs.map(postToJson);
    }
    return {
        props: { user, posts }, // will be passed to the page component as props
      };
  }

  export default function UserProfilePage({ user, posts }) {
    return (
      <main>
        <UserProfile user={user} />
        <PostFeed posts={posts} />
      </main>
    );
  }