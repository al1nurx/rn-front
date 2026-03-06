import * as SecureStore from "expo-secure-store";

export const storage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync("token", token);
  },

  async getToken() {
    const token = await SecureStore.getItemAsync("token");
    return { token };
  },

  async removeToken() {
    await SecureStore.deleteItemAsync("token");
  },
};
