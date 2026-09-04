import { Segmented } from "antd";
import { MenuGroupEnum, menuGroupLabels } from "../../../enums/menu.group.enum";
import { groupTabs } from "../../../styles/menu/menu.css";

interface GroupTabsProps {
  groups: MenuGroupEnum[];
  activeGroup: MenuGroupEnum | null;
  onSelect: (group: MenuGroupEnum) => void;
}

/// Drinks / Food. Rendered only when both actually have something on them —
/// a single-menu shop should never see a control with one option in it.
const GroupTabs = ({ groups, activeGroup, onSelect }: GroupTabsProps) => {
  if (groups.length < 2) return null;

  return (
    <div className={groupTabs}>
      <Segmented<MenuGroupEnum>
        size="large"
        value={activeGroup ?? groups[0]}
        onChange={onSelect}
        options={groups.map((group) => ({
          value: group,
          label: menuGroupLabels[group],
        }))}
      />
    </div>
  );
};

export default GroupTabs;
