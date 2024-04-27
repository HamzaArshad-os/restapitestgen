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
const GOODMOCKDATA = require("h:/restapitestgen/RestAPITestGen/GeneratedContent/Run1/GeneratedMockData/goodMockData/accounts{accountId}setLeverage_post_200_Schema23_goodMockData.json");
const ACCOUNTS_ACCOUNTID_SETLEVERAGE_POST_200_SCHEMA23_BADMOCKDATA_CHANGEDDATATYPE = require("h:/restapitestgen/RestAPITestGen/GeneratedContent/Run1/GeneratedMockData/badMockData_changedDataType/accounts{accountId}setLeverage_post_200_Schema23_badMockData_changedDataType.json");

describe('no description', () => {
  before(() => {
    console.log("[Script: " + GOODMOCKDATA + "]");
  });
  GOODMOCKDATA.forEach((item) => {
    it('Should return status 200: ', () => {
      return chai
        .request('https://your-rest-implementation.com/api')
        .post("/accounts/" + ACCOUNTID + "/setLeverage")
        .set()

        .send(item)
        .send({
  instrument: item.instrument,
  side: item.side,
  orderType: item.orderType,
  leverage: item.leverage,
})
        .then((res) => {
          expect(res).to.have.status(200);
          
          
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});

describe('no description', () => {
  before(() => {
    console.log("[Script: " + ACCOUNTS_ACCOUNTID_SETLEVERAGE_POST_200_SCHEMA23_BADMOCKDATA_CHANGEDDATATYPE + "]");
  });
  ACCOUNTS_ACCOUNTID_SETLEVERAGE_POST_200_SCHEMA23_BADMOCKDATA_CHANGEDDATATYPE.forEach((item) => {
    it('Should return status 200: ', () => {
      return chai
        .request('https://your-rest-implementation.com/api')
        .post("/accounts/" + ACCOUNTID + "/setLeverage")
        .set()

        .send(item)
        .send({
  instrument: item.instrument,
  side: item.side,
  orderType: item.orderType,
  leverage: item.leverage,
})
        .then((res) => {
          expect(res).to.have.status(200);
          
          
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
