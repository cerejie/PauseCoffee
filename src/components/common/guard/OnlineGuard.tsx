import { useParams } from "react-router-dom";
import BrandLoader from "../loader/BrandLoader";
import OnlineLayout from "../../../layouts/OnlineLayout";
import NotFoundView from "../../../pages/NotFoundView";
import { useStorefrontSettingsHook } from "../../../hook/data/settings/settings.hook";

/// The online app answers on a path the shop chooses, so the route that reaches
/// it is a dynamic segment and this is what decides whether the segment is
/// really theirs.
///
/// `/:onlineSlug` is the lowest-priority match in the tree — React Router ranks
/// a literal segment above a dynamic one, so `/cart`, `/order/:id` and
/// `/admin/*` all win before anything gets here. That is also why the settings
/// row refuses to store a slug that collides with one of them: the collision
/// would not be an error, it would simply never match, and the customer's link
/// would go quietly nowhere.
const OnlineGuard = () => {
  const { onlineSlug } = useParams<{ onlineSlug: string }>();
  const { storefront, isLoading } = useStorefrontSettingsHook();

  // The slug lives in the database, so nothing can be decided until it is read.
  // Rendering NotFound first would flash a 404 at every legitimate customer.
  if (isLoading) return <BrandLoader label="Opening the shop" />;

  if (onlineSlug !== storefront.onlineSlug) return <NotFoundView />;

  return <OnlineLayout />;
};

export default OnlineGuard;
