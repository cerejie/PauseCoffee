import { CoffeeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useEffect, useMemo } from "react";
import BrandLoader from "../../components/common/loader/BrandLoader";
import EmptyState from "../../components/common/state/EmptyState";
import CategoryRail from "../../components/menu/menus/CategoryRail";
import GroupTabs from "../../components/menu/menus/GroupTabs";
import ProductOptionsDrawer from "../../components/menu/modal/ProductOptionsDrawer";
import MenuSection from "../../components/menu/views/MenuSection";
import { useMenuListHook } from "../../hook/data/menu/menu.list.hook";
import { useProductOptionsHook } from "../../hook/data/menu/product.options.hook";
import {
  emptyState,
  hero,
  heroAccent,
  heroGreeting,
  heroSearch,
  heroTitle,
  menuFooterNote,
} from "../../styles/menu/menu.css";

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const MenuView = () => {
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
  useEffect(() => {
    if (!slugs.length) return;

    const elements = slugs
      .map((slug) => document.getElementById(`section-${slug}`))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) {
          setActiveCategorySlug(visible.target.id.replace("section-", ""));
        }
      },
      // Only the band just under the sticky rail counts as "current".
      { rootMargin: "-140px 0px -65% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [slugs, setActiveCategorySlug]);

  const scrollToSection = (slug: string) => {
    setActiveCategorySlug(slug);
    document
      .getElementById(`section-${slug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

      <p className={menuFooterNote}>
        Prices are in Philippine pesos. Pay at the counter when you pick up.
      </p>

      <ProductOptionsDrawer options={options} />
    </>
  );
};

export default MenuView;
