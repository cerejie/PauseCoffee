import { ClockCircleOutlined } from "@ant-design/icons";
import MenuBrowser from "../../components/menu/views/MenuBrowser";
import { useStorefrontSettingsHook } from "../../hook/data/settings/settings.hook";
import { closedBanner, closedBody, closedTitle } from "../../styles/online/online.css";

/// Postgres `time` is "HH:mm:ss"; only the first five characters are worth
/// reading aloud.
const shortTime = (value: string | null): string | null =>
  value ? value.slice(0, 5) : null;

/// The online menu. The same browser the counter uses, with a banner when the
/// shop is shut — browsing stays open on purpose, because someone deciding what
/// to order tomorrow is a customer worth keeping. Checkout is what closes.
const OnlineMenuView = () => {
  const { storefront } = useStorefrontSettingsHook();

  const open = shortTime(storefront.openTime);
  const close = shortTime(storefront.closeTime);

  const banner = storefront.isOnlineOrderingOpen ? null : (
    <div className={closedBanner}>
      <ClockCircleOutlined style={{ fontSize: 17, marginTop: 2 }} />
      <div>
        <p className={closedTitle}>We're not taking online orders right now</p>
        <p className={closedBody}>
          {storefront.isOutsideHours && open && close
            ? `We're open for online orders between ${open} and ${close}. Have a look around in the meantime.`
            : "Browse the menu — you just can't check out until we're back open."}
          {storefront.contactPhone ? ` Call us on ${storefront.contactPhone}.` : ""}
        </p>
      </div>
    </div>
  );

  return (
    <MenuBrowser
      banner={banner}
      footerNote="Prices are in Philippine pesos. Pay online, then upload your receipt at checkout."
    />
  );
};

export default OnlineMenuView;
