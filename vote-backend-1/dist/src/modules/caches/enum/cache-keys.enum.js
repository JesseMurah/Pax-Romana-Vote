"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = void 0;
var CacheKeys;
(function (CacheKeys) {
    CacheKeys["SMS_CODE"] = "sms_code:";
    CacheKeys["CANDIDATES_ALL"] = "candidates:all";
    CacheKeys["CANDIDATES_BY_POSITION"] = "candidates:position:";
    CacheKeys["CANDIDATE_DETAILS"] = "candidate:details:";
    CacheKeys["VOTING_SESSION"] = "voting_session:";
    CacheKeys["VOTER_STATUS"] = "voter_status:";
    CacheKeys["VOTING_STATS_LIVE"] = "voting:stats:live";
    CacheKeys["VOTING_STATS_BY_POSITION"] = "voting:stats:position:";
    CacheKeys["BALLOT_STRUCTURE"] = "ballot:structure";
    CacheKeys["BALLOT_POSITIONS"] = "ballot:positions";
    CacheKeys["SYSTEM_CONFIG"] = "system:config:";
    CacheKeys["ELECTION_TIMELINE"] = "election:timeline";
    CacheKeys["JWT_BLACKLIST"] = "jwt:blacklist:";
    CacheKeys["LOGIN_ATTEMPTS"] = "login:attempts:";
    CacheKeys["RATE_LIMIT"] = "rate_limit:";
})(CacheKeys || (exports.CacheKeys = CacheKeys = {}));
//# sourceMappingURL=cache-keys.enum.js.map