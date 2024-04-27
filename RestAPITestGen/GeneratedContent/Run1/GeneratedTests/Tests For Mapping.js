//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";

describe('Return all broker instruments with corresponding TradingView instruments. It is required to add a Broker to TradingView.com. Please note that this endpoint works without authorization! ', () => {
  it('should return status 200', () => {
    return chai
      .request('https://your-rest-implementation.com/api')
      .get(/mapping)
      .set()

      .then((res) => {
        expect(res).to.have.status(200);
        
        expect(res.body.symbols).to.exist;
expect(res.body.fields).to.exist;

      })
      .catch((err) => {
        throw err;
      });
  });
});
