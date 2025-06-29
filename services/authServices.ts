import axios from "axios";

interface LoginData {
  username: string;
  password: string;
  email: string;
  recaptchaToken: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  emailConfirmed: boolean;
}
interface ForgotPasswordForm {
  email: string;
}
interface changePasswordData {
  email?: string;
  token: string;
  password: string;
}

export async function login(data: LoginData): Promise<boolean> {
  try {
    await axios.post("https://stroymonitoring.info/stroydocs/login", data, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return false;
  }
}
export async function forgotPassword(data: ForgotPasswordForm): Promise<boolean> {
  try {
    await axios.post("https://stroymonitoring.info/stroydocs/forgotpassword", data, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return false;
  }
}

export async function register(data: LoginData): Promise<boolean> {
  try {
    await axios.post("https://stroymonitoring.info/stroydocs/register", data, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return false;
  }
}
export async function changePassword(data: changePasswordData): Promise<boolean> {
  try {
    await axios.post("https://stroymonitoring.info/stroydocs/changepassword", data, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return false;
  }
}

export async function logout(): Promise<void> {
  await axios.post(
    "https://stroymonitoring.info/stroydocs/logout",
    {},
    {
      withCredentials: true,
    }
  );
}
export async function getMe(): Promise<User | null> {
  try {
    const res = await axios.post(
      "https://stroymonitoring.info/stroydocs/me",
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("me error:", error.message);
    } else {
      console.error("me error:", error);
    }
    return null;
  }
}
