import "./PersonalPage.css";
import * as authServices from "../services/authServices";

interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
}
interface PersonalPageProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function PersonalPage({ user, setUser }: PersonalPageProps) {
  const handleLogOut = (): void => {
    authServices.logout();
    setUser(null);
  };
  return (
    <div>
      <button style={{ backgroundColor: "green" }} onClick={() => handleLogOut()}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Numquam tenetur deserunt impedit aperiam officia
        inventore repellat rem, ab quisquam praesentium et distinctio. Nesciunt quas accusantium, ipsam a sequi magnam
        aut.
      </button>
    </div>
  );
}
