import MenuBrowser from "../../components/menu/views/MenuBrowser";

/// The counter's menu. A shell around the shared browser — what differs online
/// is only how and when the customer pays.
const MenuView = () => (
  <MenuBrowser footerNote="Prices are in Philippine pesos. Pay at the counter when you pick up." />
);

export default MenuView;
