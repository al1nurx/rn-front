import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/client";

export interface Book {
  id: number;
  title: string;
  author: string;
  published?: string | null;
}

export const useBooks = () => {
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await api.get("/api/books");
      return res.data;
    },
  });

  const saveBook = useMutation({
    mutationFn: async (book: {
      id?: number;
      title: string;
      author: string;
      published?: string | null;
    }) => {
      if (book.id) {
        const res = await api.put(`/api/books?id=${book.id}`, book);
        return res.data;
      } else {
        const res = await api.post("/api/books", book);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const deleteBook = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/books?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  return {
    books,
    isLoading,
    saveBook,
    deleteBook,
  };
};
