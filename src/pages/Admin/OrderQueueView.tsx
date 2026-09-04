import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";
import BrandLoader from "../../components/common/loader/BrandLoader";
import EmptyState from "../../components/common/state/EmptyState";
import QueueBoard from "../../components/admin/queue/QueueBoard";
import { useOrderQueueHook } from "../../hook/data/admin/queue.list.hook";
import {
  statHint,
  statLabel,
  statRow,
  statTile,
  statValue,
} from "../../styles/admin/queue.css";
import { toolbar, toolbarControl, toolbarSearch } from "../../styles/layout/admin.layout.css";

const OrderQueueView = () => {
  const {
    columns,
    stats,
    search,
    setSearch,
    isLoading,
    isFetching,
    isError,
    refetch,
    advance,
    cancel,
    isUpdating,
  } = useOrderQueueHook();

  if (isLoading) return <BrandLoader label="Loading the queue" />;

  if (isError) {
    return (
      <EmptyState
        title="The queue didn't load"
        description="Check the connection to Supabase and try again."
        action={
          <Button icon={<ReloadOutlined />} onClick={() => void refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className={statRow}>
        <div className={statTile}>
          <div className={statLabel}>Waiting</div>
          <div className={statValue}>{stats.waiting}</div>
          <div className={statHint}>not started yet</div>
        </div>
        <div className={statTile}>
          <div className={statLabel}>On the bar</div>
          <div className={statValue}>{stats.brewing}</div>
          <div className={statHint}>being prepared</div>
        </div>
        <div className={statTile}>
          <div className={statLabel}>Ready</div>
          <div className={statValue}>{stats.ready}</div>
          <div className={statHint}>awaiting pickup</div>
        </div>
        <div className={statTile}>
          <div className={statLabel}>Cups in queue</div>
          <div className={statValue}>{stats.cups}</div>
          <div className={statHint}>across all tickets</div>
        </div>
      </div>

      <div className={toolbar} style={{ borderBottom: "none", padding: "0 0 14px" }}>
        <div className={toolbarSearch}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ opacity: 0.45 }} />}
            placeholder="Find a code or a name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className={toolbarControl}>
          <Tooltip title="Refresh now">
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => void refetch()}
            />
          </Tooltip>
        </div>
      </div>

      <QueueBoard
        columns={columns}
        busy={isUpdating}
        onAdvance={advance}
        onCancel={cancel}
      />
    </>
  );
};

export default OrderQueueView;
