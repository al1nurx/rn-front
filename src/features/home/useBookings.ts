import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/client";

export interface Booking {
  id: number;
  spaceId: string;
  purpose: string;
  startTime: string;
  endTime: string;
  userId: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}

export const useBookings = () => {
  const queryClient = useQueryClient();

  const {
    data: bookings,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await api.get("/api/bookings");
      return res.data;
    },
  });

  const createBooking = useMutation({
    mutationFn: async (data: Omit<Booking, "id" | "status" | "userId">) => {
      const res = await api.post("/api/bookings", data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/bookings/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.patch(`/api/bookings/${id}`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  return {
    bookings,
    refetch,
    isRefetching,
    isLoading,
    createBooking,
    deleteBooking,
    changeStatus,
  };
};
