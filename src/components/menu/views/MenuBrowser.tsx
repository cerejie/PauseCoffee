import { CoffeeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useMemo, useRef, type ReactNode } from "react";
import BrandLoader from "../../common/loader/BrandLoader";
import EmptyState from "../../common/state/EmptyState";
import CategoryRail from "../menus/CategoryRail";
import GroupTabs from "../menus/GroupTabs";
import ProductOptionsDrawer from "../modal/ProductOptionsDrawer";
import MenuSection from "./MenuSection";
import { useCategoryScrollHook } from "../../../hook/data/menu/category.scroll.hook";
import { useMenuListHook } from "../../../hook/data/menu/menu.list.hook";
import { useProductOptionsHook } from "../../../hook/data/menu/product.options.hook";
import {
  emptyState,
  hero,
  heroAccent,
  heroGreeting,
  heroSearch,
  heroTitle,
  menuFooterNote,
} from "../../../styles/menu/menu.css";

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

interface MenuBrowserProps {
  /// The one line that differs between the counter and the online app: where
  /// and when the customer pays. Everything else about browsing a menu is the
  /// same job, which is why this component is shared rather than copied.
  footerNote: ReactNode;
  /// Rendered above the hero. The online app uses it for the closed notice.
  banner?: ReactNode;
}

/// The whole menu experience — hero, search, group tabs, the docking category
/// rail, the sections, and the options drawer. Both `/` and the online app
/// render this; their page components are the shells around it.
const MenuBrowser = ({ footerNote, banner }: MenuBrowserProps) => {
  const {
    sections,
    groups,
    activeGroup,
    setActiveGroup,
    resultCount,
    search,
    setSearch,
    activeCategorySlug,
    setActiveCategorySlug,
    isLoading,
    isError,
    refetch,
  } = useMenuListHook();

  const options = useProductOptionsHook();

  const slugs = useMemo(() => sections.map((section) => section.slug), [sections]);

  // The rail follows the scroll position rather than being clicked into place,
  // so browsing the menu keeps the rail honest about where you are.
  const railRef = useRef<HTMLElement | null>(null);
  const { pinned, scrollToSection } = useCategoryScrollHook({
    slugs,
    railRef,
    setActiveSlug: setActiveCategorySlug,
  });

  if (isLoading) return <BrandLoader label="Warming up the menu" />;

  if (isError) {
    return (
      <div className={emptyState} style={{ marginTop: 40 }}>
        <EmptyState
          icon={<CoffeeOutlined />}
          title="We couldn't load the menu"
          description="Check your connection and try again — your cart is safe."
          action={
            <Button icon={<ReloadOutlined />} onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {banner}

      <div className={hero}>
        <p className={heroGreeting}>{greeting()}</p>
        <h1 className={heroTitle}>
          What are we <span className={heroAccent}>brewing</span> today?
        </h1>
        <div className={heroSearch}>
          <Input
            size="large"
            allowClear
            prefix={<SearchOutlined style={{ opacity: 0.45 }} />}
            placeholder="Search the menu…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <GroupTabs groups={groups} activeGroup={activeGroup} onSelect={setActiveGroup} />

      <CategoryRail
        sections={sections}
        activeSlug={activeCategorySlug}
        onSelect={scrollToSection}
        railRef={railRef}
        pinned={pinned}
      />

      {resultCount === 0 ? (
        <div className={emptyState} style={{ marginTop: 24 }}>
          {/* An empty search box and no results is an unstocked menu, not a
              failed search — saying "nothing matches" there sends the customer
              hunting for a typo that isn't theirs. */}
          {search.trim() ? (
            <EmptyState
              icon={<SearchOutlined />}
              title="Nothing matches that"
              description={`We couldn't find anything for "${search}". Try a different word.`}
              action={<Button onClick={() => setSearch("")}>Clear search</Button>}
            />
          ) : (
            <EmptyState
              icon={<CoffeeOutlined />}
              title="Nothing on this menu yet"
              description="Check back shortly — we're still setting things up."
              action={
                <Button icon={<ReloadOutlined />} onClick={() => void refetch()}>
                  Refresh
                </Button>
              }
            />
          )}
        </div>
      ) : (
        sections.map((section) => (
          <MenuSection
            key={section.id}
            section={section}
            onSelectProduct={(product, parent) =>
              options.open({ product, section: parent })
            }
          />
        ))
      )}

      <p className={menuFooterNote}>{footerNote}</p>

      <ProductOptionsDrawer options={options} />
    </>
  );
};

export default MenuBrowser;
