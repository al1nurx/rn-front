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
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/src/lib/client";
import { storage } from "@/src/lib/storage";
import { Book, useBooks } from "@/src/features/home/useBooks";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "@/src/components/DatePicker";

export default function Index() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<{
    name: string;
    surname: string;
    email: string;
  } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedDate, setPublishedDate] = useState<string | null>(null);

  const { books, isLoading: booksLoading, saveBook, deleteBook } = useBooks();

  useEffect(() => {
    const checkToken = async () => {
      const { token } = await storage.getToken();

      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      const res = await api.get("/api/me");

      setUser(res.data);
      setLoading(false);
    };

    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setPublishedDate(null);
    setEditingBook(null);
    setModalVisible(false);
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Validation", "Title and Author are required");
      return;
    }

    saveBook.mutate({
      id: editingBook?.id,
      title,
      author,
      published: publishedDate,
    });

    resetForm();
  };

  const handleLogout = async () => {
    await storage.removeToken();
    router.replace("/(auth)/login");
  };

  if (loading || booksLoading) {
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
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Book</Text>
        </TouchableOpacity>

        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>

                <Text
                  style={[
                    styles.status,
                    { color: item.published ? "#16a34a" : "#ef4444" },
                  ]}
                >
                  {item.published ? "Published" : "Draft"}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setEditingBook(item);
                    setTitle(item.title);
                    setAuthor(item.author);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteBook.mutate(item.id)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, opacity: 0.5 }}>
                There are no books
              </Text>
            </View>
          }
        />

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {editingBook ? "Edit Book" : "Create Book"}
              </Text>

              <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />

              <TextInput
                placeholder="Author"
                value={author}
                onChangeText={setAuthor}
                style={styles.input}
              />

              <View style={styles.switchRow}>
                <Text style={{ fontSize: 16, marginBottom: 8 }}>Published</Text>
                <DatePickerField
                  onChange={setPublishedDate}
                  initialValue={editingBook?.published || null}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>
                  {editingBook ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={{ color: "#555" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: 20,
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
