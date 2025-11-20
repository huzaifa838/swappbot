import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: "Welcome to SwappBot",
        login: "Login",
        register: "Register",
        username: "Username",
        password: "Password",
        profile: "Profile",
        send: "Send",
        newChat: "New Chat",
      },
    },
    hi: {
      translation: {
        welcome: "स्वैपबॉट में आपका स्वागत है",
        login: "लॉग इन करें",
        register: "रजिस्टर करें",
        username: "उपयोगकर्ता नाम",
        password: "पासवर्ड",
        profile: "प्रोफाइल",
        send: "भेजें",
        newChat: "नई चैट",
      },
    },
    ur: {
      translation: {
        welcome: "سوائپ بوٹ میں خوش آمدید",
        login: "لاگ ان کریں",
        register: "رجسٹر کریں",
        username: "یوزر نیم",
        password: "پاس ورڈ",
        profile: "پروفائل",
        send: "بھیجیں",
        newChat: "نئی چیٹ",
      },
    },
    ar: {
      translation: {
        welcome: "مرحبًا بك في SwapBot",
        login: "تسجيل الدخول",
        register: "تسجيل",
        username: "اسم المستخدم",
        password: "كلمة المرور",
        profile: "الملف الشخصي",
        send: "إرسال",
        newChat: "دردشة جديدة",
      },
    },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
