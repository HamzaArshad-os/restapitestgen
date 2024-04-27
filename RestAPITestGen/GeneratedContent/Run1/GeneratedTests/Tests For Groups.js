//Please make sure the correct Libaries are installed
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const path = require("path");
const url = "https://your-rest-implementation.com/api";
const SERVER_1_DESCRIPTION = "Your REST API implementation url. Change it to your real REST API url.";

describe('Get a list of possible groups of symbols. A group is a set of symbols that share a common access level. Any user can have access to any number of such groups. It is required only if you use groups of symbols in order to restrict access to the instrument's data.  **IMPORTANT:** Please plan your symbol grouping carefully. Groups cannot be deleted, you can only remove all the symbols from there.  **LIMITATIONS:** Each integration is limited to have up to 10 symbol groups. Each symbol group is limited to have up to 10K symbols in it. You cannot put the same symbol into 2 different groups.  This endpoint allows you to specify a list of groups, and the [/permissions](#operation/getPermissions) endpoint specifies which groups are available for the certain user.  When TradingView user logs into his broker account - he will gain access to one or more groups, depending on the [/permissions](#operation/getPermissions) endpoint.  At the [/symbol_info](#operation/getSymbolInfo) endpoint TradingView adds the GET argument `group` with the name of the group. Thus, TradingView will receive information about which group each symbol belongs to. ', () => {
  it('should return status 200', () => {
    return chai
      .request('https://your-rest-implementation.com/api')
      .get(/groups)
      .set()

      .then((res) => {
        expect(res).to.have.status(200);
        
        
      })
      .catch((err) => {
        throw err;
      });
  });
});
