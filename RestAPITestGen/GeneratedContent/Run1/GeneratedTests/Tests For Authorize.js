//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";
const GOODMOCKDATA = require("h:/restapitestgen/RestAPITestGen/GeneratedContent/Run1/GeneratedMockData/goodMockData/authorize_post_200_Schema0_goodMockData.json");
const AUTHORIZE_POST_200_SCHEMA0_BADMOCKDATA_CHANGEDDATATYPE = require("h:/restapitestgen/RestAPITestGen/GeneratedContent/Run1/GeneratedMockData/badMockData_changedDataType/authorize_post_200_Schema0_badMockData_changedDataType.json");

describe('Username and password authentication.', () => {
  before(() => {
    console.log("[Script: " + GOODMOCKDATA + "]");
  });
  GOODMOCKDATA.forEach((item) => {
    it('Should return status 200: ', () => {
      return chai
        .request('https://your-rest-implementation.com/api')
        .post(/authorize)
        .set()

        .send(item)
        .send({
  login: item.login,
  password: item.password,
  locale: item.locale,
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

describe('Username and password authentication.', () => {
  before(() => {
    console.log("[Script: " + AUTHORIZE_POST_200_SCHEMA0_BADMOCKDATA_CHANGEDDATATYPE + "]");
  });
  AUTHORIZE_POST_200_SCHEMA0_BADMOCKDATA_CHANGEDDATATYPE.forEach((item) => {
    it('Should return status 200: ', () => {
      return chai
        .request('https://your-rest-implementation.com/api')
        .post(/authorize)
        .set()

        .send(item)
        .send({
  login: item.login,
  password: item.password,
  locale: item.locale,
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
