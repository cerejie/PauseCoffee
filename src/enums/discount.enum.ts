/// How the shop-wide discount is expressed (app_settings.discount_type, 0021).
export enum DiscountTypeEnum {
  /// discount_value percent off each drink.
  Percent = "percent",
  /// discount_value pesos off each drink.
  Amount = "amount",
}
