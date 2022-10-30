import CreatePost from 'components/Blog/CreatePost';
import PostList from 'components/Blog/PostList';

const Blog = () => {
  return (
    <div className='p-5'>
      <CreatePost></CreatePost>
      <PostList></PostList>
    </div>
  );
};

export default Blog;
