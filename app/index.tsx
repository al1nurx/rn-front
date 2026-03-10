import { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "@/src/components/DatePicker";
import { useBookings } from "@/src/features/home/useBookings";
import { api } from "@/src/lib/client";
import { storage } from "@/src/lib/storage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: number;
    name: string;
    surname: string;
    email: string;
    role: "USER" | "ADMIN" | "MANAGER";
  } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const {
    bookings,
    isLoading,
    createBooking,
    deleteBooking,
    changeStatus,
    refetch,
    isRefetching,
  } = useBookings();

  const [spaceId, setSpaceId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const checkToken = async () => {
      const { token } = await storage.getToken();
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }
      try {
        const res = await api.get("/api/me");
        setUser(res.data);
      } catch {
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };
    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!spaceId || !purpose) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    createBooking.mutate({
      spaceId,
      purpose,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    });
    setModalVisible(false);
  };

  const handleLogout = async () => {
    await storage.removeToken();
    router.replace("/(auth)/login");
  };

  if (loading || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.userCard}>
          <Text style={styles.userName}>
            {user?.name} {user?.surname}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email} ({user?.role})
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Создать бронь</Text>
        </TouchableOpacity>

        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ flexGrow: 1, marginTop: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle}>Место: {item.spaceId}</Text>
                <Text style={styles.bookAuthor}>Цель: {item.purpose}</Text>
                <Text style={styles.status}>Статус: {item.status}</Text>
              </View>

              <View style={styles.actions}>
                {(user?.role === "MANAGER" || user?.role === "ADMIN") &&
                  item.status === "PENDING" && (
                    <TouchableOpacity
                      style={[styles.editBtn, { backgroundColor: "#16a34a" }]}
                      onPress={() =>
                        changeStatus.mutate({ id: item.id, status: "APPROVED" })
                      }
                    >
                      <Text style={styles.btnText}>Одобрить</Text>
                    </TouchableOpacity>
                  )}

                {(user?.role === "MANAGER" ||
                  user?.role === "ADMIN" ||
                  item.userId === user?.id) && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteBooking.mutate(item.id)}
                  >
                    <Text style={styles.btnText}>Удалить</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="none">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalBackground}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Новая бронь</Text>
              <TextInput
                placeholder="ID Пространства"
                value={spaceId}
                onChangeText={setSpaceId}
                style={styles.input}
              />
              <TextInput
                placeholder="Цель"
                value={purpose}
                onChangeText={setPurpose}
                style={styles.input}
              />

              <Text>Начало:</Text>
              <DatePickerField
                onChange={(date) => setStartDate(new Date(date))}
              />
              <Text>Конец:</Text>
              <DatePickerField
                onChange={(date) => setEndDate(new Date(date))}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Создать</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ textAlign: "center" }}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f5",
  },

  wrapper: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  userCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3,
  },

  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },

  userEmail: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  bookCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  bookAuthor: {
    color: "#555",
    marginTop: 2,
  },

  status: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  editBtn: {
    backgroundColor: "#eab308",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  btnText: {
    color: "white",
    fontWeight: "600",
  },

  logoutContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },

  logoutButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000070",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  switchRow: {
    marginBottom: 16,
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  saveText: {
    color: "white",
    fontWeight: "600",
  },

  cancelBtn: {
    alignItems: "center",
    padding: 10,
  },
});
