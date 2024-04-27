//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";

describe('Stream of prices. Server constantly keeps the connection alive. If the connection is broken - the server constantly tries to restore it. TradingView establishes up to 4 simultaneous connections to this endpoint and expects to get the same data to all of them. Transfer mode is `chunked encoding`. The data feed should set `'Transfer-Encoding: chunked'` and make sure that all intermediate proxies are set to use this mode. All messages are to be ended with `\n`. Data stream should contain real-time data only. It shouldn't contain snapshots of data.  Data feed should provide trades and quotes: - If trades are not provided, then data feed should set trades with bid price and bid size (mid price with 0 size in case of Forex). - Size is always greater than `0`, except for the correction. In that case size can be `0`. - Quote must contain prices of the best ask and the best bid. - Daily bars are required if they cannot be built from trades (has-daily should be set to true in the symbol information in that case).  The broker must remove unnecessary restrictions (firewall, rate limits, etc.) for the set of IP addresses of our servers.  `StreamingHeartbeatResponse` is a technical message that prevents the feed from unsubscribing from streaming. It doesn't affect the price data and should be sent to /streaming every 5 seconds by default. The message can be used, for example, when the trading session is closed on weekends or in case of low liquidity on the exchange when TradingView does not receive price updates for a long time.  Please note, that `StreamingAskResponse` and `StreamingBidResponse` are deprecated. The `StreamingQuoteResponse` should be used to provide ask / bid data. ', () => {
  it('should return status 200', () => {
    return chai
      .request('https://your-rest-implementation.com/api')
      .get(/streaming)
      .set()

      .then((res) => {
        expect(res).to.have.status(200);
        
        
      })
      .catch((err) => {
        throw err;
      });
  });
});
