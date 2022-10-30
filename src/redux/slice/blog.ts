import { AsyncThunk, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from 'types/blog';
import instance from 'utils/axios';

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

interface BlogSlice {
  postList: Post[];
  editingPost: Post | null;
  loading: boolean;
  currentRequestId: undefined | string;
}
const initialState: BlogSlice = {
  postList: [],
  editingPost: null,
  loading: false,
  currentRequestId: undefined,
};

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await instance.get<Post[]>('/posts', {
    signal: thunkAPI.signal,
  });
  return response.data;
});

export const addPost = createAsyncThunk('blog/addPost', async (post: Post, thunkAPI) => {
  const response = await instance.post<Post>('/posts', post, {
    signal: thunkAPI.signal,
  });
  return response.data;
});

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
  const response = await instance.delete<Post>(`/posts/${postId}`, {
    signal: thunkAPI.signal,
  });
  return response.data;
});

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, post }: { postId: string; post: Post }, thunkAPI) => {
    const response = await instance.put<Post>(`/posts/${postId}`, post, {
      signal: thunkAPI.signal,
    });
    return response.data;
  },
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const findPost = state.postList.find((post) => post.id === postId) || null;

      state.editingPost = findPost;
    },
    cancelEditingPost: (state) => {
      state.editingPost = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload);
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        const findPostIndex = state.postList.findIndex((post) => post.id === postId);
        if (findPostIndex !== -1) {
          state.postList.splice(findPostIndex, 1);
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload;
            return true;
          }
          return false;
        });
        state.editingPost = null;
      })
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true;
          state.currentRequestId = action.meta.requestId;
        },
      )
      .addMatcher<FulfilledAction>(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false;
            state.currentRequestId = undefined;
          }
        },
      )
      .addMatcher<RejectedAction>(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false;
            state.currentRequestId = undefined;
          }
        },
      );
  },
});

export const { startEditingPost, cancelEditingPost } = blogSlice.actions;

export default blogSlice.reducer;
