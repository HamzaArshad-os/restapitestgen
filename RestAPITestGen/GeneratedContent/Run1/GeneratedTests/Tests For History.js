//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";
let SYMBOL = "reprehenderit";
let RESOLUTION = "Lorem dolore";
let FROM = 4886113.662273139;
let TO = 80068575.8554866;
let COUNTBACK = -356439.7684478611;

describe('Request for history bars. Each property of the response object is treated as a table column.  Data should meet the following requirements:  - real-time data obtained from the API streaming endpoint must match the historical data, obtained from the   /history API. The allowed count of mismatched bars (candles) must not exceed 5% for frequently traded symbols,   otherwise the integration to TradingView is not possible; - the data must not include unreasonable price gaps, historical data gaps on 1-minute and Daily-resolutions   (temporal gaps), obviously incorrect prices (adhesions).  Bar time for daily bars should be 00:00 UTC and is expected to be a trading day (not a day when the session starts).  Bar time for monthly bars should be 00:00 UTC and is the first trading day of the month.  If there is no data in the requested time period, you should return an empty response: `{"s":"ok","t":[],"o":[],"h":[],"l":[],"c":[],"v":[]}` ', () => {
  it('should return status 200', () => {
    return chai
      .request('https://your-rest-implementation.com/api')
      .get(/history)
      .set()

      .then((res) => {
        expect(res).to.have.status(200);
        
        
      })
      .catch((err) => {
        throw err;
      });
  });
});
