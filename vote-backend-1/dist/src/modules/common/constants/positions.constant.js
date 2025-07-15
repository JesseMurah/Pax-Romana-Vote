"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOTING_ORDER = exports.POSITION_REQUIREMENTS = exports.POSITIONS = void 0;
exports.POSITIONS = {
    PRESIDENT: 'PRESIDENT',
    VICE_PRESIDENT: 'VICE_PRESIDENT',
    GENERAL_SECRETARY: 'GENERAL_SECRETARY',
    FINANCIAL_SECRETARY: 'FINANCIAL_SECRETARY',
    ORGANIZING_SECRETARY: 'ORGANIZING_SECRETARY',
    ORGANIZING_SECRETARY_ASST: 'ORGANIZING_SECRETARY_ASST',
    PRO_MAIN: 'PRO_MAIN',
    PRO_ASST: 'PRO_ASST',
    WOMENS_COMMISSIONER: 'WOMENS_COMMISSIONER',
};
exports.POSITION_REQUIREMENTS = {
    [exports.POSITIONS.PRESIDENT]: {
        minLevel: 200,
        maxLevel: 300,
        description: 'Chief Executive Officer of Pax Romana KNUST',
    },
    [exports.POSITIONS.VICE_PRESIDENT]: {
        minLevel: 200,
        maxLevel: 300,
        description: 'Deputy to the President',
    },
    [exports.POSITIONS.GENERAL_SECRETARY]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Secretary to the President',
    },
    [exports.POSITIONS.ORGANIZING_SECRETARY]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Organize Pax Activities',
    },
    [exports.POSITIONS.ORGANIZING_SECRETARY_ASST]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Assist in organizing Pax Activities',
    },
    [exports.POSITIONS.FINANCIAL_SECRETARY]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Financial Officer of Pax Activities',
    },
    [exports.POSITIONS.PRO_MAIN]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Promotional Officer of Pax Activities',
    },
    [exports.POSITIONS.PRO_ASST]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Assist in promoting Pax Activities',
    },
    [exports.POSITIONS.WOMENS_COMMISSIONER]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Representative of Pax Ladies',
    }
};
exports.VOTING_ORDER = [
    exports.POSITIONS.PRESIDENT,
    exports.POSITIONS.VICE_PRESIDENT,
    exports.POSITIONS.GENERAL_SECRETARY,
    exports.POSITIONS.FINANCIAL_SECRETARY,
    exports.POSITIONS.ORGANIZING_SECRETARY,
    exports.POSITIONS.ORGANIZING_SECRETARY_ASST,
    exports.POSITIONS.PRO_MAIN,
    exports.POSITIONS.PRO_ASST,
    exports.POSITIONS.WOMENS_COMMISSIONER
];
//# sourceMappingURL=positions.constant.js.map