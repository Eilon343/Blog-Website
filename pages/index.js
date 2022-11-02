import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import Loader from "../components/loader";
import { collection,collectionGroup,getDocs,limit,orderBy,query,startAfter,where} from "firebase/firestore";
import { database, postToJson } from "../lib/firebase";
import { useState } from "react";
import PostFeed from "../components/PostFeed";
import { Timestamp, } from 'firebase/firestore';


//Max post to query per page
const LIMIT = 1;

export async function getServerSideProps(context) {

  const postsQuery = query(collectionGroup(database, "posts"), 
  where("published", "==", true), 
  orderBy("createdAt", "desc"), 
  limit(LIMIT));


  const posts = (await getDocs(postsQuery)).docs.map(postToJson);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];
    const cursor = typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : last.createdAt
    console.log(last);
    console.log(cursor);
    


    const q = query(
      collectionGroup(database, "posts"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(LIMIT)
    );

    const newPosts = (await getDocs(q)).docs.map((doc) => doc.data());
    console.log(newPosts)

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  );
}
