import { Tabs } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmEmailModal from "../../components/account/modal/ConfirmEmailModal";
import RegisterForm from "../../components/account/form/RegisterForm";
import SignInForm from "../../components/account/form/SignInForm";
import BrandMark from "../../components/common/brand/BrandMark";
import {
  authTabs,
  backHome,
  brandCopy,
  brandFoot,
  brandHeadline,
  brandPane,
  brandTop,
  card,
  cardTitle,
  formPane,
  shell,
} from "../../styles/admin/login.css";

type AuthTab = "signin" | "register";

const AdminLoginView = () => {
  // Genuinely local: the pane dies with this screen the moment a session
  // exists, and nothing outside it reads which tab is showing.
  const [tab, setTab] = useState<AuthTab>("signin");

  return (
    <div className={shell}>
      <aside className={brandPane}>
        <div className={brandTop}>
          <BrandMark tone="light" />
        </div>

        <div>
          <h1 className={brandHeadline}>Every order, the moment it lands.</h1>
          <p className={brandCopy}>
            The counter view for Pause Coffee — a live queue, one tap per stage, and the
            full order history behind it.
          </p>
        </div>

        <p className={brandFoot}>Approved accounts only</p>
      </aside>

      <section className={formPane}>
        <div className={card}>
          <h2 className={cardTitle}>Pause admin</h2>

          <Tabs
            className={authTabs}
            activeKey={tab}
            onChange={(key) => setTab(key as AuthTab)}
            items={[
              { key: "signin", label: "Sign in", children: <SignInForm /> },
              {
                key: "register",
                label: "Create account",
                children: <RegisterForm onRegistered={() => setTab("signin")} />,
              },
            ]}
          />

          <Link to="/" className={backHome}>
            ← Back to the menu
          </Link>
        </div>
      </section>

      {/* Opened by the sign-up mutation, from either tab's side of the store. */}
      <ConfirmEmailModal />
    </div>
  );
};

export default AdminLoginView;
