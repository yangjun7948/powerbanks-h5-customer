import { defineStore } from "pinia";
import { loginByFingerprint, loginByPhone, getUserInfo } from "@/api/user";
import { ss } from "@/utils/storage/";
interface StateType {
  token: string;
  userInfo: any;
}

export const useUserStore = defineStore("user", {
  state: (): StateType => ({
    token: ss.get("token") || "",
    userInfo: ss.get("userInfo") || {},
  }),
  getters: {
    getToken: (state) => state.token,
  },
  actions: {
    async anonymousLogin(fingerprint: string) {
      if (this.token) {
        return;
      }
      const openId = ss.get("openId");
      const data = await loginByFingerprint(fingerprint, openId);
      this.token = data.token;
      ss.set("token", this.token);
      const userInfo = await getUserInfo().data;
      ss.set("userInfo", userInfo);
    },
    async phoneLogin(
      phone: string,
      code: string,
      openId: string,
      fingerprint: string
    ) {
      const data = await loginByPhone({
        username: phone,
        phoneCode: code,
        openId: openId,
        fingerprint: fingerprint,
      });
      this.token = data.token;
      ss.set("token", this.token);
      const userInfo = await getUserInfo();
      this.userInfo = userInfo.user;
      ss.set("userInfo", this.userInfo);
    },
    logout() {
      this.token = "";
      ss.remove("token");
      ss.remove("userInfo");
      this.userInfo = {};
    },
  },
});
