import { Card } from "antd";
import MyCol from "../myCol/MyCol";

function MyCard({
  colProps,
  children,
  ...props
}) {
  const card = (
    <Card
      {...props}
    >
      {children}
    </Card>
  );

  if (colProps) {
    return (
      <MyCol
        {...colProps}
      >
        {card}
      </MyCol>
    );
  }

  return card;
}

MyCard.Meta = Card.Meta;

export default MyCard;
