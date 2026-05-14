export enum CacheKeys {
    // SMS verification codes
    SMS_CODE = 'sms_code:', // sms_code:${phoneNumber}

    // Candidates data
    CANDIDATES_ALL = 'candidates:all',
    CANDIDATES_BY_POSITION = 'candidates:position:', // candidates:position:${position}
    CANDIDATE_DETAILS = 'candidate:details:', // candidate:details:${candidateId}

    // Voting sessions
    VOTING_SESSION = 'voting_session:', // voting_session:${phoneHash}
    VOTER_STATUS = 'voter_status:', // voter_status:${phoneHash}

    // Real-time voting stats
    VOTING_STATS_LIVE = 'voting:stats:live',
    VOTING_STATS_BY_POSITION = 'voting:stats:position:', // voting:stats:position:${position}

    // Ballot structure
    BALLOT_STRUCTURE = 'ballot:structure',
    BALLOT_POSITIONS = 'ballot:positions',

    // System configuration
    SYSTEM_CONFIG = 'system:config:', // system:config:${key}
    ELECTION_TIMELINE = 'election:timeline',

    // Authentication
    JWT_BLACKLIST = 'jwt:blacklist:', // jwt:blacklist:${tokenId}
    LOGIN_ATTEMPTS = 'login:attempts:', // login:attempts:${phone}

    // Rate limiting
    RATE_LIMIT = 'rate_limit:', // rate_limit:${identifier}
}