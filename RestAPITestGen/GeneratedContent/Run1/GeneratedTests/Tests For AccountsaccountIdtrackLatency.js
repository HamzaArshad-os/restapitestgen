//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";
let ACCOUNTID = "anim nisi ex";
const GOODMOCKDATA = require("h:/restapitestgen/RestAPITestGen/GeneratedContent/Run1/GeneratedMockData/goodMockData/accounts{accountId}trackLatency_post_200_Schema37_goodMockData.json");
const ACCOUNTS_ACCOUNTID_TRACKLATENCY_POST_200_SCHEMA37_BADMOCKDATA_CHANGEDDATATYPE = require("h:/restapitestgen/RestAPITestGen/GeneratedContent/Run1/GeneratedMockData/badMockData_changedDataType/accounts{accountId}trackLatency_post_200_Schema37_badMockData_changedDataType.json");

describe('no description', () => {
  before(() => {
    console.log("[Script: " + GOODMOCKDATA + "]");
  });
  GOODMOCKDATA.forEach((item) => {
    it('Should return status 200: ', () => {
      return chai
        .request('https://your-rest-implementation.com/api')
        .post("/accounts/" + ACCOUNTID + "/trackLatency")
        .set()

        .send(item)
        .send({
  transactionId: item.transactionId,
  transactionType: item.transactionType,
  instrument: item.instrument,
  qty: item.qty,
  side: item.side,
  ask: item.ask,
  bid: item.bid,
  timestamp: item.timestamp,
  roundTripStartTime: item.roundTripStartTime,
  roundTripDuration: item.roundTripDuration,
})
        .then((res) => {
          expect(res).to.have.status(200);
          
          expect(res.body.s).to.exist;

        })
        .catch((err) => {
          throw err;
        });
    });
  });
});

describe('no description', () => {
  before(() => {
    console.log("[Script: " + ACCOUNTS_ACCOUNTID_TRACKLATENCY_POST_200_SCHEMA37_BADMOCKDATA_CHANGEDDATATYPE + "]");
  });
  ACCOUNTS_ACCOUNTID_TRACKLATENCY_POST_200_SCHEMA37_BADMOCKDATA_CHANGEDDATATYPE.forEach((item) => {
    it('Should return status 200: ', () => {
      return chai
        .request('https://your-rest-implementation.com/api')
        .post("/accounts/" + ACCOUNTID + "/trackLatency")
        .set()

        .send(item)
        .send({
  transactionId: item.transactionId,
  transactionType: item.transactionType,
  instrument: item.instrument,
  qty: item.qty,
  side: item.side,
  ask: item.ask,
  bid: item.bid,
  timestamp: item.timestamp,
  roundTripStartTime: item.roundTripStartTime,
  roundTripDuration: item.roundTripDuration,
})
        .then((res) => {
          expect(res).to.have.status(200);
          
          expect(res.body.s).to.exist;

        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
