//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";
let GROUP = "culpa nisi";

describe('Get a list of all instruments.', () => {
  it('should return status 200', () => {
    return chai
      .request('https://your-rest-implementation.com/api')
      .get(/symbol_info)
      .set()

      .then((res) => {
        expect(res).to.have.status(200);
        
        
      })
      .catch((err) => {
        throw err;
      });
  });
});
