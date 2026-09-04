import { QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import { useAppHook } from "./hook/app/app.hook";
import { useBrandVars } from "./hook/common/brand.hook";
import { appRoot } from "./styles/common/global.css";

const App = () => {
  const { config, queryClient, router } = useAppHook();
  const brandVars = useBrandVars();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={config}>
        <AntdApp>
          {/* The style contract is assigned once, here. */}
          <div className={appRoot} style={brandVars}>
            <RouterProvider router={router} />
          </div>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
