import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export interface JPUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string };
}

export interface JPPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface JPComment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface JPAlbum {
  userId: number;
  id: number;
  title: string;
}

export interface JPPhoto {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface JPTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`JSONPlaceholder API error: ${res.status}`);
  return res.json();
}

export const useJPUsers = (limit?: number) =>
  useQuery({
    queryKey: ["jp-users", limit],
    queryFn: async () => {
      const data = await fetchJSON<JPUser[]>("/users");
      return limit ? data.slice(0, limit) : data;
    },
  });

export const useJPPosts = (limit?: number) =>
  useQuery({
    queryKey: ["jp-posts", limit],
    queryFn: async () => {
      const data = await fetchJSON<JPPost[]>("/posts");
      return limit ? data.slice(0, limit) : data;
    },
  });

export const useJPComments = (postId?: number) =>
  useQuery({
    queryKey: ["jp-comments", postId],
    queryFn: () =>
      fetchJSON<JPComment[]>(postId ? `/posts/${postId}/comments` : "/comments"),
  });

export const useJPAlbums = (limit?: number) =>
  useQuery({
    queryKey: ["jp-albums", limit],
    queryFn: async () => {
      const data = await fetchJSON<JPAlbum[]>("/albums");
      return limit ? data.slice(0, limit) : data;
    },
  });

export const useJPPhotos = (albumId?: number, limit?: number) =>
  useQuery({
    queryKey: ["jp-photos", albumId, limit],
    queryFn: async () => {
      const data = await fetchJSON<JPPhoto[]>(
        albumId ? `/albums/${albumId}/photos` : "/photos"
      );
      return limit ? data.slice(0, limit) : data;
    },
  });

export const useJPTodos = (limit?: number) =>
  useQuery({
    queryKey: ["jp-todos", limit],
    queryFn: async () => {
      const data = await fetchJSON<JPTodo[]>("/todos");
      return limit ? data.slice(0, limit) : data;
    },
  });

export const useJPUserById = (id: number) =>
  useQuery({
    queryKey: ["jp-user", id],
    queryFn: () => fetchJSON<JPUser>(`/users/${id}`),
    enabled: id > 0,
  });

export const useJPPostById = (id: number) =>
  useQuery({
    queryKey: ["jp-post", id],
    queryFn: () => fetchJSON<JPPost>(`/posts/${id}`),
    enabled: id > 0,
  });
