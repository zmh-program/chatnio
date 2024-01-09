package admin

var MarketInstance *Market

func InitInstance() {
	MarketInstance = NewMarket()
}
