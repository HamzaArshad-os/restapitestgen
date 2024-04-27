//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";
let LOCALE = "fa_IR";
let ACCOUNTID = "anim nisi ex";
let SYMBOLS = "eu ea reprehenderit sunt Excepteur";

describe('Stream current prices of the instrument. The `bid` and `ask` fields are required, and the `buyPipValue` and `sellPipValue` fields are desirable if the account currency is different from the currency of the instrument. The same values should be sent for these fields if different values for buying and selling are not supported. ', () => {
  it('should return status 200', () => {
    return chai
      .request('https://your-rest-implementation.com/api')
      .get(/stream/quotes)
      .set()

      .then((res) => {
        expect(res).to.have.status(200);
        
        
      })
      .catch((err) => {
        throw err;
      });
  });
});
