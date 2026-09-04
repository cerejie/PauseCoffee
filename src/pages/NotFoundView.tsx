import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundView = () => {
  const navigate = useNavigate();

  return (
    <Result
      style={{ minHeight: "100dvh", display: "grid", alignContent: "center" }}
      status="404"
      title="Nothing brewing here"
      subTitle="That page doesn't exist."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Back to the menu
        </Button>
      }
    />
  );
};

export default NotFoundView;
